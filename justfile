set positional-arguments

default:
	just --list

dev:
	deno task dev

@run day='':
	deno run --allow-read main.ts $1

test:
	deno test --allow-read  src/**/*

