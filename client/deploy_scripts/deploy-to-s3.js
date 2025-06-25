#!/usr/bin/env node

/**
 * deploy-to-s3.js - Script to build React app and deploy to S3
 * Usage: node deploy-to-s3.js <bucket-name> [profile] [region] [cloudfront-id]
 */

const { execSync } = require('child_process');
const path = require('path');

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
};

// Helper function to execute shell commands
function runCommand(command) {
  try {
    return execSync(command, { stdio: 'inherit' });
  } catch (error) {
    console.error(`${colors.red}Command failed: ${command}${colors.reset}`);
    process.exit(1);
  }
}

// Main function
async function main() {
  // Get command line arguments
  const args = process.argv.slice(2);
  const bucketName = args[0] || 'milal-react-app';
  const awsProfile = args[1] || 'default';
  const awsRegion = args[2] || 'us-east-1';
  const cloudfrontId = args[3] || 'E3N5MYFVJ0YF81';

  // Check if bucket name is provided
  if (!bucketName) {
    console.error(`${colors.red}Error: S3 bucket name is required${colors.reset}`);
    console.log('Usage: node deploy-to-s3.js <bucket-name> [profile] [region] [cloudfront-id]');
    process.exit(1);
  }

  console.log(`${colors.cyan}🚀 Deploying React app to S3 bucket: ${bucketName}${colors.reset}`);
  console.log(`Using AWS Profile: ${awsProfile}`);
  console.log(`Using AWS Region: ${awsRegion}`);

  // Check if AWS CLI is installed
  try {
    execSync('aws --version', { stdio: 'ignore' });
  } catch (error) {
    console.error(`${colors.red}❌ AWS CLI is not installed. Please install it first.${colors.reset}`);
    console.log('https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html');
    process.exit(1);
  }

  // Check if the bucket exists
  console.log(`${colors.cyan}🔍 Checking if bucket exists...${colors.reset}`);
  try {
    execSync(
      `aws s3api head-bucket --bucket "${bucketName}" --region "${awsRegion}" --profile "${awsProfile}"`,
      { stdio: 'ignore' }
    );
  } catch (error) {
    console.error(`${colors.red}❌ Bucket ${bucketName} does not exist or you don't have access to it.${colors.reset}`);
    console.error(`${colors.yellow}Please create the bucket first and configure it for static website hosting.${colors.reset}`);
    process.exit(1);
  }

  // Build React app
  console.log(`${colors.cyan}🔨 Building React app...${colors.reset}`);
  runCommand('npm install');
  runCommand('npm run build');
  console.log(`${colors.green}✅ Build successful!${colors.reset}`);

  // Deploy to S3
  console.log(`${colors.cyan}📤 Uploading build files to S3...${colors.reset}`);
  
  // Upload static assets with long cache duration
  runCommand(
    `aws s3 sync build/ "s3://${bucketName}" --delete --profile "${awsProfile}" --region "${awsRegion}" --cache-control "max-age=31536000,public,immutable" --exclude "index.html" --exclude "asset-manifest.json" --exclude "manifest.json"`
  );
  
  // Upload HTML and JSON files with no-cache settings
  console.log(`${colors.cyan}📤 Uploading HTML and JSON files with no-cache settings...${colors.reset}`);
  runCommand(
    `aws s3 sync build/ "s3://${bucketName}" --delete --profile "${awsProfile}" --region "${awsRegion}" --cache-control "no-cache,no-store,must-revalidate" --exclude "*" --include "index.html" --include "asset-manifest.json" --include "manifest.json"`
  );

  // Invalidate CloudFront distribution if provided
  if (cloudfrontId) {
    console.log(`${colors.cyan}🔄 Invalidating CloudFront distribution: ${cloudfrontId}${colors.reset}`);
    runCommand(
      `aws cloudfront create-invalidation --distribution-id "${cloudfrontId}" --paths "/*" --profile "${awsProfile}"`
    );
  }

  // Get the S3 website URL
  const websiteUrl = `http://${bucketName}.s3-website-${awsRegion}.amazonaws.com`;
  console.log(`${colors.green}✅ Deployment complete!${colors.reset}`);
  console.log(`${colors.green}🌐 Your website is available at: ${websiteUrl}${colors.reset}`);
}

// Run the main function
main().catch(error => {
  console.error(`${colors.red}Error: ${error.message}${colors.reset}`);
  process.exit(1);
}); 