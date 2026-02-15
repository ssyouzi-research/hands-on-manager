#!/bin/bash
set -e

STACK_NAME=${1:-hands-on-manager}

echo "Getting S3 bucket name from CloudFormation stack..."
BUCKET_NAME=$(aws cloudformation describe-stacks \
  --stack-name $STACK_NAME \
  --query 'Stacks[0].Outputs[?OutputKey==`WebsiteBucketName`].OutputValue' \
  --output text)

if [ -z "$BUCKET_NAME" ]; then
  echo "Error: Could not find S3 bucket name in stack outputs"
  exit 1
fi

echo "Building Next.js application..."
cd admin-ui
pnpm run build

echo "Uploading to S3 bucket: $BUCKET_NAME"
aws s3 sync out/ s3://$BUCKET_NAME/ --delete

echo "Getting CloudFront distribution ID..."
DISTRIBUTION_ID=$(aws cloudformation describe-stacks \
  --stack-name $STACK_NAME \
  --query 'Stacks[0].Outputs[?OutputKey==`CloudFrontDistributionId`].OutputValue' \
  --output text)

if [ -n "$DISTRIBUTION_ID" ]; then
  echo "Invalidating CloudFront cache..."
  aws cloudfront create-invalidation \
    --distribution-id $DISTRIBUTION_ID \
    --paths "/*"
  echo "Deployment completed successfully!"
else
  echo "Warning: Could not find CloudFront distribution ID"
  echo "Deployment completed (without cache invalidation)"
fi
