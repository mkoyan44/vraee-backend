# Backend - Container Management
# Usage: make run TARGET_ARCH=amd64

REPO_ROOT := $(shell git rev-parse --show-toplevel)
.NOTPARALLEL:
SHELL := /bin/bash

# CI Detection
ifeq ($(CI),true)
    SUDO := sudo
else
    SUDO :=
endif

# Architecture
ifndef TARGET_ARCH
  TARGET_ARCH := amd64
endif

# Project
PROJECT := render-agency-backend
NETWORK := render-network

# Image
BACKEND_IMAGE := $(PROJECT)

# Database
DB_USER := postgres
DB_PASS := postgrespassword
DB_NAME := render_agency
DB_URL := postgresql://$(DB_USER):$(DB_PASS)@postgres:5432/$(DB_NAME)

# Colors
RESET := \033[0m
GREEN := \033[32m
BLUE := \033[34m

.PHONY: help vars network infra-up infra-down build up down run ps logs clean

help:
	@echo "$(BLUE)Render Agency - Backend$(RESET)"
	@echo ""
	@echo "make run TARGET_ARCH=amd64    - Clean, build, start"
	@echo "make build TARGET_ARCH=amd64  - Build image"
	@echo "make up                       - Start container"
	@echo "make down                     - Stop container"
	@echo "make ps                       - Show status"
	@echo "make logs                     - Show logs"
	@echo "make clean                    - Remove everything"
	@echo "make infra-up                 - Start infrastructure (DB, Redis)"
	@echo "make infra-down               - Stop infrastructure"

vars:
	@echo "$(BLUE)>>> TARGET_ARCH=$(TARGET_ARCH)$(RESET)"

network:
	@nerdctl network create $(NETWORK) 2>/dev/null || true

# Infrastructure (if running standalone)
infra-up: network
	@echo "$(BLUE)>>> Starting infrastructure...$(RESET)"
	@nerdctl compose up -d postgres redis pgadmin
	@echo "$(GREEN)✓ Infrastructure started$(RESET)"

infra-down:
	@echo "$(BLUE)>>> Stopping infrastructure...$(RESET)"
	@nerdctl compose down
	@echo "$(GREEN)✓ Infrastructure stopped$(RESET)"

# Build
build: vars network
	@echo "$(BLUE)>>> Building backend...$(RESET)"
	@nerdctl build --build-arg TARGET_ARCH=$(TARGET_ARCH) \
	   -t $(BACKEND_IMAGE):latest \
	   -f docker/dockerfiles/Dockerfile.backend \
	   .
	@echo "$(GREEN)✓ Backend built$(RESET)"

# Run
up:
	@echo "$(BLUE)>>> Starting backend container...$(RESET)"
	@nerdctl run -d --name $(PROJECT) \
	   --network $(NETWORK) \
	   -p 4000:4000 \
	   -e NODE_ENV=production \
	   -e DATABASE_URL=$(DB_URL) \
	   -e REDIS_URL=redis://redis:6379 \
	   --restart unless-stopped \
	   $(BACKEND_IMAGE):latest 2>/dev/null || true
	@echo "$(GREEN)✓ Backend started$(RESET)"
	@echo ""
	@echo "Backend:  http://localhost:4000"

down:
	@echo "$(BLUE)>>> Stopping backend container...$(RESET)"
	@nerdctl stop $(PROJECT) 2>/dev/null || true
	@nerdctl rm $(PROJECT) 2>/dev/null || true
	@echo "$(GREEN)✓ Stopped$(RESET)"

# Main workflow
run: clean infra-up build up

# Status
ps:
	@echo "$(BLUE)Backend Container:$(RESET)"
	@nerdctl ps --filter name=$(PROJECT)
	@echo ""
	@echo "$(BLUE)Infrastructure:$(RESET)"
	@nerdctl compose ps

logs:
	@nerdctl logs -f $(PROJECT)

# Cleanup
clean: down
	@echo "$(BLUE)>>> Cleaning backend...$(RESET)"
	@nerdctl rmi $(BACKEND_IMAGE):latest -f 2>/dev/null || true
	@echo "$(GREEN)✓ Clean$(RESET)"

# Full cleanup (including infrastructure)
clean-all: clean infra-down
	@echo "$(GREEN)✓ Full cleanup complete$(RESET)"