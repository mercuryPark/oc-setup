---
name: frontend-design
description: 프론트엔드 UI/UX 디자인 가이드. 컴포넌트 설계, 레이아웃, 접근성 시 사용.
---
# Frontend Design Guide

## Component Design
- 단일 책임: 한 컴포넌트는 한 가지 역할
- 합성 패턴 우선 (children, slots)
- Props는 5개 이하 권장

## Accessibility
- 시맨틱 HTML 사용
- ARIA 속성 적절히
- 키보드 네비게이션 지원
- 충분한 색상 대비

## Responsive
- 모바일 퍼스트
- breakpoint: 640px, 768px, 1024px, 1280px
