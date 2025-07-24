#!/usr/bin/env node

/**
 * deploy-to-ecr.js - Script to build and push Docker image to Amazon ECR
 * Usage: node deploy-to-ecr.js [repository] [region] [profile]
 * Run in parent /server directory with Dockferfile
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
    console.log(`${colors.yellow}Executing: ${command}${colors.reset}`);
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
  const repository = args[0] || '491362634851.dkr.ecr.us-east-1.amazonaws.com/milal-app';
  const awsRegion = args[1] || 'us-east-1';
  const awsProfile = args[2] || 'default';

  console.log(`${colors.cyan}🚀 Building and pushing Docker image to ECR${colors.reset}`);
  console.log(`Repository: ${repository}`);
  console.log(`AWS Region: ${awsRegion}`);
  console.log(`AWS Profile: ${awsProfile}`);

  // Check if Docker is installed
  try {
    execSync('docker --version', { stdio: 'ignore' });
  } catch (error) {
    console.error(`${colors.red}❌ Docker is not installed. Please install it first.${colors.reset}`);
    console.log('https://docs.docker.com/get-docker/');
    process.exit(1);
  }

  // Check if AWS CLI is installed
  try {
    execSync('aws --version', { stdio: 'ignore' });
  } catch (error) {
    console.error(`${colors.red}❌ AWS CLI is not installed. Please install it first.${colors.reset}`);
    console.log('https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html');
    process.exit(1);
  }

  // Check if Docker buildx is available
  try {
    execSync('docker buildx version', { stdio: 'ignore' });
  } catch (error) {
    console.error(`${colors.red}❌ Docker buildx is not available. Please install it first.${colors.reset}`);
    console.log('https://docs.docker.com/buildx/working-with-buildx/');
    process.exit(1);
  }

  // Get the repository name without the URL
  const repositoryName = repository.split('/').pop();

  // Check if the repository exists
  console.log(`${colors.cyan}🔍 Checking if ECR repository exists...${colors.reset}`);
  try {
    execSync(
      `aws ecr describe-repositories --repository-names "${repositoryName}" --region "${awsRegion}" --profile "${awsProfile}"`,
      { stdio: 'ignore' }
    );
  } catch (error) {
    console.error(`${colors.red}❌ Repository ${repositoryName} does not exist or you don't have access to it.${colors.reset}`);
    console.error(`${colors.yellow}Please create the repository first.${colors.reset}`);
    console.error(`${colors.yellow}You can create it with: aws ecr create-repository --repository-name "${repositoryName}" --region "${awsRegion}" --profile "${awsProfile}"${colors.reset}`);
    process.exit(1);
  }

  // Authenticate Docker to ECR
  console.log(`${colors.cyan}🔑 Authenticating with AWS ECR...${colors.reset}`);
  runCommand(
    `aws ecr get-login-password --region "${awsRegion}" --profile "${awsProfile}" | docker login --username AWS --password-stdin ${repository.split('/')[0]}`
  );

  // Build and push the Docker image
  console.log(`${colors.cyan}🔨 Building and pushing Docker image...${colors.reset}`);
  runCommand(
    `docker buildx build --platform linux/amd64 --push -t "${repository}" .`
  );

  console.log(`${colors.green}✅ Docker image successfully built and pushed to ECR!${colors.reset}`);
  console.log(`${colors.green}Repository: ${repository}${colors.reset}`);
}

// Run the main function
main().catch(error => {
  console.error(`${colors.red}Error: ${error.message}${colors.reset}`);
  process.exit(1); 
});
