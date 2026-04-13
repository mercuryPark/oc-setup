---
name: testing
description: 테스트 코드 작성 시 참조하는 패턴과 가이드라인. 테스트 작성, 테스트 전략, TDD 시 사용.
---
# Testing Guide

## Principles
- 각 테스트는 하나의 동작만 검증
- Given-When-Then 패턴
- 테스트 간 의존성 금지
- Mock은 최소한으로

## Naming
- test("should [expected behavior] when [condition]")

## Structure
- unit: 개별 함수/컴포넌트
- integration: 모듈 간 상호작용
- e2e: 사용자 시나리오
