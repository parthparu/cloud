#!/usr/bin/env bash
# Deletes the local k3d cluster and everything in it.
set -euo pipefail
k3d cluster delete chatscale
