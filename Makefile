.PHONY: dev build preview chrome chrome-gl install clean deploy help

# Development server
dev:
	npm run dev

# Production build
build:
	npm run build

# Preview production build
preview:
	npm run preview

# Install dependencies
install:
	npm install

# Launch Chrome with WebGPU + Vulkan (recommended for Linux)
chrome:
	google-chrome --enable-unsafe-webgpu --enable-features=Vulkan --use-vulkan http://localhost:5173

# Launch Chrome with WebGPU + OpenGL (fallback if Vulkan has shader errors)
chrome-gl:
	google-chrome --enable-unsafe-webgpu --use-angle=gl http://localhost:5173

# Deploy to Vercel
deploy:
	npx vercel --prod

# Clean build artifacts
clean:
	rm -rf dist node_modules

# Help
help:
	@echo "Available commands:"
	@echo "  make dev       - Start development server"
	@echo "  make build     - Build for production"
	@echo "  make preview   - Preview production build"
	@echo "  make install   - Install dependencies"
	@echo "  make chrome    - Launch Chrome with WebGPU + Vulkan"
	@echo "  make chrome-gl - Launch Chrome with WebGPU + OpenGL (fallback)"
	@echo "  make deploy    - Deploy to Vercel"
	@echo "  make clean     - Remove dist and node_modules"
	@echo "  make help      - Show this help message"
