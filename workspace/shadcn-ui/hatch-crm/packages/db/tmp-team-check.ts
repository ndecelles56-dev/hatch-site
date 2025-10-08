import { prisma } from './src/index'

async function main() {
  try {
    const rows = await prisma.teamMember.findMany({ where: { tenantId: 'tenant-hatch' } })
    console.log(rows)
  } catch (error) {
    console.error('query error', error)
  } finally {
    await prisma.$disconnect()
  }
}

void main()
