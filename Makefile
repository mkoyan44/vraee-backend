# Render Agency - Backend Makefile
# Backend Container Management + Deployment Pipeline

# Project Configuration
PROJECT_NAME := $(shell git rev-parse --show-toplevel | awk -F/ '{print $$NF}')
BRANCH_NAME := $(shell git rev-parse --abbrev-ref HEAD)
REPO_ROOT := $(shell git rev-parse --show-toplevel)
CODE_BASE_PATH ?= ${REPO_ROOT}
NAMESPACE ?= ${PROJECT_NAME}

.NOTPARALLEL:
SHELL := /bin/bash
.EXPORT_ALL_VARIABLES:

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

# Backend Project Settings
PROJECT := render-agency-backend
NETWORK := render-network
BACKEND_IMAGE := $(PROJECT)

# Backend Port Configuration
ifndef PORT
  PORT := 4000
endif

# Database Configuration (PostgreSQL)
ifndef DB_HOST
  DB_HOST := localhost
endif
ifndef DB_PORT
  DB_PORT := 5432
endif
ifndef DB_USER
  DB_USER := postgres
endif
ifndef DB_PASSWORD
  DB_PASSWORD := postgrespassword
endif
ifndef DB_NAME
  DB_NAME := render_agency
endif

# Redis Configuration
ifndef REDIS_HOST
  REDIS_HOST := redis
endif
ifndef REDIS_PORT
  REDIS_PORT := 6379
endif

# CI/CD Configuration
ifndef DE_PROJECT_NAME
  DE_PROJECT_NAME := 4lock-de
endif

# Node Environment
ifndef NODE_ENV
  NODE_ENV := development
endif

# Environment Files
ENV_FILE := ${REPO_ROOT}/.env
CONFIG_FILE := ${REPO_ROOT}/config.json
PACKAGE_JSON := ${REPO_ROOT}/package.json

# Check if .env file exists and is not empty
ifeq (,$(wildcard $(ENV_FILE)))
$(error ".env file not found at $(ENV_FILE)")
endif
ifeq ($(shell test -s $(ENV_FILE) && echo non-empty || echo empty), empty)
$(error ".env file is empty at $(ENV_FILE)")
endif

include $(ENV_FILE)
export $(shell sed 's/=.*//' $(ENV_FILE))

# Validate critical variables
CRITICAL_VARS := GH_TOKEN GH_OWNER
$(foreach var,$(CRITICAL_VARS),\
	$(if $(filter undefined,$(origin $(var))),\
		$(error "Critical variable $(var) is not set"),))
$(foreach var,$(CRITICAL_VARS),\
	$(if $(shell [ -z "$($(var))" ] && echo empty),\
		$(error "Critical variable $(var) is empty"),))

# Validate architecture
ifeq ($(filter $(TARGET_ARCH),arm64 amd64),)
    $(error "Invalid TARGET_ARCH value: $(TARGET_ARCH). Must be one of arm64,amd64.")
endif

export GH_REPO
export TARGET_ARCH

# Registry Configuration
REGISTRY_FQDN := ghcr.io
COMPOSED_BUILD_ARGS := --build-arg TARGET_ARCH=$(TARGET_ARCH)
BACKEND_IMAGE_NAME := ${REGISTRY_FQDN}/${GH_OWNER}/${PROJECT_NAME}-backend-${TARGET_ARCH}
BACKEND_IMAGE_TAG := $(if $(VERSION),$(VERSION),latest)

# Colors
RESET := \033[0m
GREEN := \033[32m
BLUE := \033[34m
YELLOW := \033[33m

# =============================================================================
# HELP & INFO
# =============================================================================

.PHONY: help vars
help:
	@echo "$(BLUE)===============================================$(RESET)"
	@echo "$(BLUE)Render Agency - Backend Makefile$(RESET)"
	@echo "$(BLUE)===============================================$(RESET)"
	@echo ""
	@echo "$(YELLOW)Backend Container Management:$(RESET)"
	  @echo "  make run TARGET_ARCH=amd64                    - Clean, build, start backend"
	@echo "  make build TARGET_ARCH=amd64                  - Build backend image"
	@echo "  make up                                       - Start backend container"
	@echo "  make up PORT=3000                             - Start with custom port"
	@echo "  make down                                     - Stop backend container"
	@echo "  make ps                                       - Show container status"
	@echo "  make logs                                     - Show container logs"
	@echo "  make clean                                    - Remove backend container & image"
	@echo ""
	@echo "$(YELLOW)Development:$(RESET)"
	@echo "  make dev                                      - Start in development mode"
	@echo "  make install                                  - Install npm dependencies"
	@echo "  make test                                     - Run tests"
	@echo "  make migrate                                  - Run database migrations"
	@echo "  make seed                                     - Seed database"
	@echo "  make lint                                     - Run linter"
	@echo "  make format                                   - Format code"
	@echo "  make shell                                    - Open shell in container"
	@echo "  make db-shell                                 - Open PostgreSQL shell"
	@echo "  make redis-shell                              - Open Redis CLI"
	@echo ""
	@echo "$(YELLOW)Deployment Pipeline:$(RESET)"
	@echo "  make backend-build                            - Build and push backend image"
	@echo "  make backend-apply                            - Apply Kubernetes manifests"
	@echo "  make backend                                  - Full deployment (build + apply)"
	@echo "  make set-version V=1.0.0                      - Update package.json version"
	@echo ""
	@echo "$(YELLOW)Registry & Authentication:$(RESET)"
	@echo "  make gh                                       - Login to GitHub registry"
	@echo "  make clone-de-repo                            - Clone deployment repository"
	@echo ""
	@echo "$(YELLOW)Backend Image Management:$(RESET)"
	@echo "  make nerdctl-backend-build                    - Build backend image with nerdctl"
	@echo "  make nerdctl-backend-push                     - Push backend image with nerdctl"
	@echo "  make sudo-backend-build                       - Build backend image with sudo nerdctl"
	@echo "  make sudo-backend-push                        - Push backend image with sudo nerdctl"
	@echo ""

vars:
	@echo "$(BLUE)>>> Configuration Variables$(RESET)"
	@echo "TARGET_ARCH          = $(TARGET_ARCH)"
	@echo "PORT                 = $(PORT)"
	@echo "NODE_ENV             = $(NODE_ENV)"
	@echo "DB_HOST              = $(DB_HOST)"
	@echo "DB_PORT              = $(DB_PORT)"
	@echo "DB_USER              = $(DB_USER)"
	@echo "DB_NAME              = $(DB_NAME)"
	@echo "REDIS_HOST           = $(REDIS_HOST)"
	@echo "REDIS_PORT           = $(REDIS_PORT)"
	@echo "NAMESPACE            = $(NAMESPACE)"
	@echo "PROJECT_NAME         = $(PROJECT_NAME)"
	@echo "BRANCH_NAME          = $(BRANCH_NAME)"
	@echo "REPO_ROOT            = $(REPO_ROOT)"
	@echo "REGISTRY_FQDN        = $(REGISTRY_FQDN)"
	@echo "BACKEND_IMAGE_NAME   = $(BACKEND_IMAGE_NAME)"
	@echo "BACKEND_IMAGE_TAG    = $(BACKEND_IMAGE_TAG)"
	@echo "DE_PROJECT_NAME      = $(DE_PROJECT_NAME)"
	@echo "GH_OWNER             = $(GH_OWNER)"
	@echo "GH_REPO              = $(GH_REPO)"

# =============================================================================
# VERSION MANAGEMENT
# =============================================================================

.PHONY: set-version
set-version:
	$(eval ACTUAL_VERSION := $(if $(V),$(V),$(if $(VERSION),$(VERSION),latest)))
	@echo "$(BLUE)>>> Updating package.json version to $(ACTUAL_VERSION)$(RESET)"
	@sed -i.bak 's/"version": *"[^"]*"/"version": "$(ACTUAL_VERSION)"/' $(PACKAGE_JSON)
	@echo "$(GREEN)✓ Version updated to $(ACTUAL_VERSION)$(RESET)"
	@rm -f $(PACKAGE_JSON).bak

# =============================================================================
# DEPLOYMENT REPOSITORY
# =============================================================================

.PHONY: clone-de-repo gh-login gh
clone-de-repo:
	@echo "$(BLUE)>>> Cloning deployment repository...$(RESET)"
	cd ${REPO_ROOT}/.git/ && \
	git clone git@github.com:mkoyan44/${DE_PROJECT_NAME}.git || true && \
	cd ${REPO_ROOT}/.git/${DE_PROJECT_NAME}/ && \
	git fetch --all --tags && \
	git checkout -f main && \
	git pull -f -X theirs && \
	cd ${REPO_ROOT}
	@echo "$(GREEN)✓ Deployment repository ready$(RESET)"

gh-login:
	@echo "$(BLUE)>>> Logging into GitHub registry...$(RESET)"
	cd ${REPO_ROOT}/.git/${DE_PROJECT_NAME}/ && \
	cp ${REPO_ROOT}/.env . && \
	make -f makefiles/Makefile.k8s gh-login \
		REGISTRY_FQDN="${REGISTRY_FQDN}" \
		REPO_ROOT="${REPO_ROOT}"
	@echo "$(GREEN)✓ Logged in$(RESET)"

gh: clone-de-repo gh-login

# =============================================================================
# BACKEND CONTAINER MANAGEMENT
# =============================================================================

.PHONY: network build up down run ps logs clean
network:
	@echo "$(BLUE)>>> Creating network...$(RESET)"
	@nerdctl network create $(NETWORK) 2>/dev/null || true
	@echo "$(GREEN)✓ Network ready$(RESET)"

build: vars network
	@echo "$(BLUE)>>> Building backend container...$(RESET)"
	@nerdctl build --build-arg TARGET_ARCH=$(TARGET_ARCH) \
	   -t $(BACKEND_IMAGE):latest \
	   -f docker/dockerfiles/Dockerfile.backend \
	   .
	@echo "$(GREEN)✓ Backend built$(RESET)"

up:
	@echo "$(BLUE)>>> Starting backend container...$(RESET)"
	@nerdctl run -d --name $(PROJECT) \
	   --network $(NETWORK) \
	   -p $(PORT):$(PORT) \
	   --env-file $(ENV_FILE) \
	   --restart unless-stopped \
	   $(BACKEND_IMAGE):latest 2>/dev/null || true
	@echo "$(GREEN)✓ Backend started$(RESET)"
	@echo ""
	@echo "Backend API: http://localhost:$(PORT)"
	@echo "Database:    postgresql://$(DB_USER):***@$(DB_HOST):$(DB_PORT)/$(DB_NAME)"
	@echo "Redis:       $(REDIS_HOST):$(REDIS_PORT)"

down:
	@echo "$(BLUE)>>> Stopping backend container...$(RESET)"
	@nerdctl stop $(PROJECT) 2>/dev/null || true
	@nerdctl rm $(PROJECT) 2>/dev/null || true
	@echo "$(GREEN)✓ Stopped$(RESET)"

run: clean build up

ps:
	@echo "$(BLUE)Backend Container:$(RESET)"
	@nerdctl ps --filter name=$(PROJECT)

logs:
	@nerdctl logs -f $(PROJECT)

clean: down
	@echo "$(BLUE)>>> Cleaning backend...$(RESET)"
	@nerdctl rmi $(BACKEND_IMAGE):latest -f 2>/dev/null || true
	@echo "$(GREEN)✓ Clean$(RESET)"

# Development helpers
dev:
	@echo "$(BLUE)>>> Starting backend in development mode...$(RESET)"
	@npm run dev

install:
	@echo "$(BLUE)>>> Installing dependencies...$(RESET)"
	@npm install
	@echo "$(GREEN)✓ Dependencies installed$(RESET)"

test:
	@echo "$(BLUE)>>> Running tests...$(RESET)"
	@npm test

migrate:
	@echo "$(BLUE)>>> Running database migrations...$(RESET)"
	@npm run migrate

seed:
	@echo "$(BLUE)>>> Seeding database...$(RESET)"
	@npm run seed

lint:
	@echo "$(BLUE)>>> Running linter...$(RESET)"
	@npm run lint

format:
	@echo "$(BLUE)>>> Formatting code...$(RESET)"
	@npm run format

# Shell access
shell:
	@echo "$(BLUE)>>> Opening shell in backend container...$(RESET)"
	@nerdctl exec -it $(PROJECT) /bin/sh

# Database shell
db-shell:
	@echo "$(BLUE)>>> Opening PostgreSQL shell...$(RESET)"
	@nerdctl exec -it $(PROJECT) psql -h $(DB_HOST) -U $(DB_USER) -d $(DB_NAME)

# Redis shell
redis-shell:
	@echo "$(BLUE)>>> Opening Redis CLI...$(RESET)"
	@nerdctl exec -it $(PROJECT) redis-cli -h $(REDIS_HOST) -p $(REDIS_PORT)

# =============================================================================
# BACKEND IMAGE BUILD & PUSH
# =============================================================================

.PHONY: nerdctl-backend-build nerdctl-backend-push sudo-backend-build sudo-backend-push
nerdctl-backend-build: set-version
	@echo "$(BLUE)>>> Building backend image...$(RESET)"
	nerdctl build -f docker/dockerfiles/Dockerfile.backend $(COMPOSED_BUILD_ARGS) -t ${BACKEND_IMAGE_NAME}:${BACKEND_IMAGE_TAG} .
	@echo "$(GREEN)✓ Backend image built$(RESET)"

nerdctl-backend-push:
	@echo "$(BLUE)>>> Pushing backend image...$(RESET)"
	nerdctl push ${BACKEND_IMAGE_NAME}:${BACKEND_IMAGE_TAG}
	@echo "$(GREEN)✓ Backend image pushed$(RESET)"

sudo-backend-build: set-version
	@echo "$(BLUE)>>> Building backend image (sudo)...$(RESET)"
	sudo nerdctl build -f docker/dockerfiles/Dockerfile.backend $(COMPOSED_BUILD_ARGS) -t ${BACKEND_IMAGE_NAME}:${BACKEND_IMAGE_TAG} .
	@echo "$(GREEN)✓ Backend image built$(RESET)"

sudo-backend-push:
	@echo "$(BLUE)>>> Pushing backend image (sudo)...$(RESET)"
	sudo nerdctl push ${BACKEND_IMAGE_NAME}:${BACKEND_IMAGE_TAG}
	@echo "$(GREEN)✓ Backend image pushed$(RESET)"

# =============================================================================
# KUBERNETES DEPLOYMENT
# =============================================================================

.PHONY: j2m-apply-backend backend-apply backend-build backend
j2m-apply-backend:
	@echo "$(BLUE)>>> Applying Kubernetes manifests...$(RESET)"
	cd ${REPO_ROOT}/.git/${DE_PROJECT_NAME}/ && \
	cp ${REPO_ROOT}/.env . && \
	make -f makefiles/Makefile.k8s j2-apply \
		REGISTRY_FQDN="${REGISTRY_FQDN}" \
		J2_APP="backend" \
		RENDERED_DIR="${REPO_ROOT}/j2mization" \
		NAMESPACE="${NAMESPACE}" \
		ACTION="apply" \
		REPO_ROOT="${REPO_ROOT}"
	@echo "$(GREEN)✓ Manifests applied$(RESET)"

backend-apply: clone-de-repo j2m-apply-backend

backend-build: nerdctl-backend-build gh nerdctl-backend-push

backend: backend-build backend-apply
	@echo "$(GREEN)✓ Full backend deployment complete$(RESET)"