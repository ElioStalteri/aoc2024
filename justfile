default:
	just --list

dev:
	deno task dev
run:
	deno run --allow-read main.ts
test:
	deno test --allow-read  src/**/*
