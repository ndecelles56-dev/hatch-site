import { createClient } from 'npm:@supabase/supabase-js'
import { corsHeaders } from '../_shared/cors.ts'

const supabaseUrl = Deno.env.get('SUPABASE_URL')
const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase configuration')
}

const client = createClient(supabaseUrl, supabaseAnonKey)

const sanitizeTerm = (value: string) =>
  value.replace(/[%_]/g, (match) => `\\${match}`)

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'GET') {
    return new Response('Method not allowed', {
      status: 405,
      headers: corsHeaders,
    })
  }

  const url = new URL(req.url)
  const path = url.pathname.replace(/^\/consumer-properties/, '')

  try {
    if (!path || path === '') {
      const searchParams = url.searchParams
      const bboxParam = searchParams.get('bbox')
      const queryParam = searchParams.get('q')?.trim()
      const filtersParam = searchParams.get('filters')
      const limitParam = searchParams.get('limit')
      const limit = Math.min(parseInt(limitParam || '150', 10) || 150, 200)

      let filters: Record<string, unknown> = {}
      if (filtersParam) {
        try {
          filters = JSON.parse(filtersParam)
        } catch (err) {
          console.warn('Failed to parse filters param', err)
        }
      }

      let builder = client
        .from('vw_consumer_properties')
        .select('*')
        .order('published_at', { ascending: false })
        .limit(limit)

      if (bboxParam) {
        const parts = bboxParam.split(',').map((value) => Number(value.trim()))
        if (parts.length === 4 && parts.every((value) => Number.isFinite(value))) {
          const [minLon, minLat, maxLon, maxLat] = parts
          builder = builder
            .gte('longitude', minLon)
            .lte('longitude', maxLon)
            .gte('latitude', minLat)
            .lte('latitude', maxLat)
        }
      }

      if (queryParam) {
        const term = sanitizeTerm(queryParam)
        builder = builder.or(
          [
            `city.ilike.%${term}%`,
            `state_code.ilike.%${term}%`,
            `zip_code.ilike.%${term}%`,
            `street_name.ilike.%${term}%`,
            `address_line.ilike.%${term}%`,
            `public_remarks.ilike.%${term}%`,
          ].join(',')
        )
      }

      const priceMin = Number(filters.priceMin)
      const priceMax = Number(filters.priceMax)
      if (Number.isFinite(priceMin)) {
        builder = builder.gte('list_price', priceMin)
      }
      if (Number.isFinite(priceMax)) {
        builder = builder.lte('list_price', priceMax)
      }

      const bedsMin = Number(filters.bedroomsMin ?? filters.beds)
      if (Number.isFinite(bedsMin) && bedsMin > 0) {
        builder = builder.gte('bedrooms_total', bedsMin)
      }

      const bathsMin = Number(filters.bathroomsMin ?? filters.baths)
      if (Number.isFinite(bathsMin) && bathsMin > 0) {
        builder = builder.gte('bathrooms_total', bathsMin)
      }

      if (typeof filters.propertyType === 'string' && filters.propertyType.trim()) {
        const typeTerm = sanitizeTerm(filters.propertyType.trim())
        builder = builder.ilike('property_type', `%${typeTerm}%`)
      }

      if (filters.status === 'sold') {
        builder = builder.eq('state', 'SOLD')
      } else if (filters.status === 'pending') {
        builder = builder.eq('state', 'LIVE').ilike('status', 'pending')
      } else {
        builder = builder.eq('state', 'LIVE')
      }

      const { data, error } = await builder

      if (error) {
        console.error('Failed to load consumer properties', error)
        return new Response(JSON.stringify({ error: 'failed_to_fetch' }), {
          status: 500,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        })
      }

      return new Response(JSON.stringify({ data }), {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      })
    }

    const segments = path.split('/').filter(Boolean)
    if (segments.length === 1) {
      const identifier = decodeURIComponent(segments[0])
      let detail = await client
        .from('vw_consumer_properties')
        .select('*')
        .eq('id', identifier)
        .maybeSingle()

      if (!detail.data) {
        detail = await client
          .from('vw_consumer_properties')
          .select('*')
          .eq('slug', identifier)
          .maybeSingle()
      }

      const data = detail.data
      const error = detail.error

      if (error) {
        console.error('Failed to fetch consumer property detail', error)
        return new Response(JSON.stringify({ error: 'failed_to_fetch' }), {
          status: 500,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        })
      }

      if (!data) {
        return new Response(JSON.stringify({ error: 'not_found' }), {
          status: 404,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        })
      }

      return new Response(JSON.stringify({ data }), {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      })
    }

    return new Response('Not found', { status: 404, headers: corsHeaders })
  } catch (error) {
    console.error('Unexpected consumer properties error', error)
    return new Response(JSON.stringify({ error: 'unexpected_error' }), {
      status: 500,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
    })
  }
})
