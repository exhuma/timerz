#!/bin/bash

set -e

sudo apt-get update
sudo apt-get install -y netcat-openbsd

curl -LsSf https://astral.sh/uv/install.sh | sh

uv tool install pre-commit
