import { SetMetadata } from '@nestjs/common';

export const FEATURE_FLAG_KEY = 'featureFlag';

export const FeatureFlag = (name: string) => SetMetadata(FEATURE_FLAG_KEY, name);
