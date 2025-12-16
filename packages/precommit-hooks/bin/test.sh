#!/bin/bash

# Test that secret protection is set up correctly. 
# This will create a separate file ./demo-password.txt which will need to be deleted separately. 

RANDOM_NUMBER="$(LC_ALL=C tr -cd '[:digit:]' < /dev/urandom | fold -w 10 | head -n 1)"
FAKE_KEY="sk-${RANDOM_NUMBER}abcdef"

echo "Creating test file containing dummy key: 'fake_key=${FAKE_KEY}'"
echo "fake_key=${FAKE_KEY}" > ./demo-password.txt

echo "Attempting to commit file containing secret"
git add ./demo-password.txt && git commit -m "This should fail due to detecting dummy creds"
