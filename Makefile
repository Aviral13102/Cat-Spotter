.PHONY: setup data train test dev build smoke deploy lint

# Detect OS for cross-platform commands
ifeq ($(OS),Windows_NT)
    PYTHON = python
    PIP = pip
    VENV_ACTIVATE = venv\Scripts\activate
    SEP = \\
    RM = rmdir /s /q
    MKDIR = mkdir
    NPX = npx
else
    PYTHON = python3
    PIP = pip3
    VENV_ACTIVATE = source venv/bin/activate
    SEP = /
    RM = rm -rf
    MKDIR = mkdir -p
    NPX = npx
endif

BACKEND_DIR = backend
FRONTEND_DIR = frontend

setup: setup-backend setup-frontend
	@echo "✅ Setup complete"

setup-backend:
	cd $(BACKEND_DIR) && $(PYTHON) -m venv venv
	cd $(BACKEND_DIR) && venv$(SEP)Scripts$(SEP)pip install -r requirements.txt 2>nul || cd $(BACKEND_DIR) && . venv/bin/activate && pip install -r requirements.txt
	@echo "✅ Backend setup complete"

setup-frontend:
	cd $(FRONTEND_DIR) && npm install
	@echo "✅ Frontend setup complete"

data:
	cd $(BACKEND_DIR) && venv$(SEP)Scripts$(SEP)python -m app.ml.augment 2>nul || cd $(BACKEND_DIR) && venv/bin/python -m app.ml.augment
	@echo "✅ Data augmentation complete"

train:
	cd $(BACKEND_DIR) && venv$(SEP)Scripts$(SEP)python -m app.ml.train 2>nul || cd $(BACKEND_DIR) && venv/bin/python -m app.ml.train
	@echo "✅ Model training complete"

test: test-backend test-frontend
	@echo "✅ All tests passed"

test-backend:
	cd $(BACKEND_DIR) && venv$(SEP)Scripts$(SEP)python -m pytest tests/ -v 2>nul || cd $(BACKEND_DIR) && venv/bin/python -m pytest tests/ -v
	@echo "✅ Backend tests passed"

test-frontend:
	cd $(FRONTEND_DIR) && npm test -- --run
	@echo "✅ Frontend tests passed"

dev:
	@echo "Starting backend and frontend dev servers..."
	@echo "Backend: http://localhost:8000"
	@echo "Frontend: http://localhost:5173"
	@start /b cmd /c "cd $(BACKEND_DIR) && venv\Scripts\python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000" 2>nul || (cd $(BACKEND_DIR) && venv/bin/python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000 &)
	cd $(FRONTEND_DIR) && npm run dev

build: build-frontend
	@echo "✅ Production build complete"

build-frontend:
	cd $(FRONTEND_DIR) && npm run build
	@echo "✅ Frontend build complete"

smoke:
	cd $(BACKEND_DIR) && venv$(SEP)Scripts$(SEP)python ../scripts/smoke_ws.py 2>nul || cd $(BACKEND_DIR) && venv/bin/python ../scripts/smoke_ws.py
	@echo "✅ Smoke test passed"

lint: lint-backend lint-frontend
	@echo "✅ All lints passed"

lint-backend:
	cd $(BACKEND_DIR) && venv$(SEP)Scripts$(SEP)python -m ruff check app/ tests/ 2>nul || cd $(BACKEND_DIR) && venv/bin/python -m ruff check app/ tests/

lint-frontend:
	cd $(FRONTEND_DIR) && $(NPX) tsc --noEmit
	cd $(FRONTEND_DIR) && $(NPX) eslint src/

deploy:
	bash deploy/deploy.sh
	@echo "✅ Deployment complete"
