#!/bin/bash

# Test that secret protection is set up correctly. 
# This will create a separate file ./demo-password.txt which will need to be deleted separately. 

RANDOM_NUMBER="$(LC_ALL=C tr -cd '[:digit:]' < /dev/urandom | fold -w 13 | head -n 1)"
AWS_KEY="AKIA${RANDOM_NUMBER}ASD"

echo "Creating test file containing dummy AWS_KEY=${AWS_KEY}"
echo "fake_aws_key=${AWS_KEY}" > ./demo-password.txt

echo "Attempting to commit file containing secret"
git add ./demo-password.txt && git commit -m "This should fail due to detecting dummy AWS creds"
