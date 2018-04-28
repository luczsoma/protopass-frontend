#!/bin/bash

exitWithMessageOnError () {
  if [ ! $? -eq 0 ]; then
    echo "An error has occurred during web site deployment."
    echo $1
    exit 1
  fi
}

# Prerequisites
# -------------

# Verify node.js installed
hash node 2>/dev/null
exitWithMessageOnError "Missing node.js executable, please install node.js, if already installed make sure it can be reached from current environment."

# Setup
# -----

SCRIPT_DIR=`pwd`

DEPLOYMENT_SOURCE=$SCRIPT_DIR
DEPLOYMENT_TEMP="$SCRIPT_DIR/../temp"
DEPLOYMENT_TARGET="$SCRIPT_DIR/../wwwroot"

# Install kudu sync
echo Installing Kudu Sync
npm.cmd install kudusync -g --silent
exitWithMessageOnError "kudusync install failed"

##################################################################################################################################
# Deployment
# ----------

echo "Handling Angular deployment."

# 1. Copying the repository to temp
echo "Copying the repository to temp"
rm -rf ${DEPLOYMENT_TEMP}
mkdir ${DEPLOYMENT_TEMP}
kudusync -v 50 -f "$DEPLOYMENT_SOURCE" -t "$DEPLOYMENT_TEMP" -i ".git;.deployment;deploy.sh"
exitWithMessageOnError "Repository could not be copied to temp"

# 2. Installing dependencies
echo "Installing dependencies"
pushd "$DEPLOYMENT_TEMP"
npm.cmd install
exitWithMessageOnError "npm failed"
popd

# 3. Building the Angular application
echo "Building the Angular application"
pushd ${DEPLOYMENT_TEMP}
node ./node_modules/.bin/ng build --target=production
exitWithMessageOnError "build failed"
popd

# 4. Copying the contents of temp/dist to /wwwroot
kudusync -v 50 -f "$DEPLOYMENT_TEMP"/dist -t "$DEPLOYMENT_TARGET"
exitWithMessageOnError "Copying to /wwwroot failed."


##################################################################################################################################
echo "Finished successfully."
