# BeensLab Hitmark

[![Powered by Firebase](https://img.shields.io/badge/Powered%20by-Firebase-FFCA28?style=flat-square&logo=firebase)](https://firebase.google.com/)
[![AWS Lambda](https://img.shields.io/badge/AWS-Lambda-FF9900?style=flat-square&logo=amazon-aws)](https://aws.amazon.com/lambda/)
[![API Gateway](https://img.shields.io/badge/AWS-API%20Gateway-FF9900?style=flat-square&logo=amazon-aws)](https://aws.amazon.com/api-gateway/)

Hitmark은 블로그 포스트나 웹 페이지의 조회수를 추적하고 시각화할 수 있는 서비스입니다. 이 프로젝트는 AWS Lambda와 Firebase를 활용하여 확장 가능하고 신뢰할 수 있는 방식으로 조회수 데이터를 추적하고 SVG 형태의 시각적 배지를 생성합니다.

## 목차

- [주요 기능](#주요-기능)
- [아키텍처](#아키텍처)
- [환경 설정](#환경-설정)
- [설치 및 배포](#설치-및-배포)
- [사용 방법](#사용-방법)
- [개발 가이드](#개발-가이드)
- [문제 해결](#문제-해결)
- [라이센스](#라이센스)

## 주요 기능

- **실시간 조회수 추적**: 도메인별, 포스트별 조회수를 실시간으로 추적
- **일일 및 총 조회수**: 당일 조회수와 누적 조회수를 함께 표시
- **SVG 배지 생성**: 포스트에 삽입할 수 있는 시각적 조회수 배지 생성
- **서버리스 아키텍처**: 확장성 높은 AWS Lambda 및 Firebase 기반 구조

## 아키텍처

Hitmark는 다음과 같은 기술 스택으로 구성되어 있습니다:

- **AWS Lambda**: 서버리스 함수로 요청 처리 및 조회수 업데이트 로직 실행
- **Amazon API Gateway**: API 엔드포인트 제공 및 Lambda 함수 트리거
- **Firebase Firestore**: 조회수 데이터를 저장하는 NoSQL 데이터베이스
- **TypeScript**: 타입 안전성과 개발 효율성을 제공하는 프로그래밍 언어

### 데이터 모델

Firestore 데이터베이스는 다음과 같은 구조로 설계되어 있습니다:

```
beenslab (collection)
└── {domain} (document)
    └── posts (collection)
        └── {post_id} (document)
            ├── total_hits: number
            ├── today_hits: number
            └── last_hits_date: string (YYYY-MM-DD)
```

## 환경 설정

### 사전 요구 사항

- [Node.js](https://nodejs.org/) (v14 이상)
- [AWS CLI](https://aws.amazon.com/cli/) 설치 및 구성
- [Firebase 프로젝트](https://console.firebase.google.com/) 생성

### Firebase 설정

1. Firebase 콘솔에서 새 프로젝트를 생성하거나 기존 프로젝트를 선택합니다.
2. 프로젝트 설정 > 서비스 계정 탭에서 "새 비공개 키 생성" 버튼을 클릭하여 서비스 계정 키를 다운로드합니다.
3. 다운로드한 키를 안전한 위치에 보관합니다 (이 키는 AWS Lambda의 환경 변수로 사용됩니다).

## 설치 및 배포

### 로컬 개발 환경 설정

```bash
# 저장소 클론
git clone https://github.com/yourusername/beenslab-hitmark.git
cd beenslab-hitmark

# 의존성 설치
npm install

# TypeScript 컴파일
npm run build
```

### AWS Lambda 배포

1. 프로젝트를 빌드하여 배포 패키지 생성:

```bash
npm run build
```

2. `dist` 디렉토리의 내용과 `node_modules`를 ZIP 파일로 압축:

```bash
cd dist
zip -r ../function.zip .
cd ..
zip -r function.zip node_modules
```

3. AWS Lambda 콘솔에서 함수 생성 및 ZIP 파일 업로드

4. 다음 환경 변수 설정:
   - `FIREBASE_SERVICE_ACCOUNT`: Firebase 서비스 계정 키 JSON 파일의 내용

5. API Gateway 설정:
   - REST API 생성
   - 새 리소스 및 GET 메서드 생성
   - Lambda 함수와 통합
   - API 배포

## 사용 방법

웹페이지나 블로그 포스트에 조회수 배지를 추가하려면 다음과 같은 HTML을 사용합니다:

```html
<img src="https://your-api-gateway-url.execute-api.region.amazonaws.com/stage?domain=yourdomain.com&post_id=your-post-id" alt="조회수">
```

매개변수:
- `domain`: 웹사이트 도메인 (예: `example.com`)
- `post_id`: 게시물 고유 식별자 (예: `2023-09-15-my-post`)

## 개발 가이드

### 프로젝트 구조

```
beenslab-hitmark/
├── dist/                # 컴파일된 JavaScript 파일
├── node_modules/        # 의존성 모듈
├── .git/                # Git 저장소
├── index.ts             # 메인 애플리케이션 코드
├── package.json         # 프로젝트 메타데이터 및 의존성
├── package-lock.json    # 의존성 버전 잠금 파일
├── serviceAccountKey.json # Firebase 서비스 계정 키 (배포 시 제외)
├── tsconfig.json        # TypeScript 구성
└── tsconfig.build.json  # 빌드용 TypeScript 구성
```

### 기능 확장

조회수 배지 디자인 수정:

1. `index.ts` 파일의 `generateSVG` 함수를 수정합니다.
2. 빌드하고 Lambda 함수를 다시 배포합니다.

## 문제 해결

- **배지가 표시되지 않음**: API Gateway URL, 도메인 및 포스트 ID 매개변수를 확인하세요.
- **'Internal Server Error'**: Lambda 함수 로그를 확인하고 Firebase 서비스 계정 키가 올바르게 설정되었는지 확인하세요.
- **조회수가 업데이트되지 않음**: Firestore 데이터베이스 권한 및 규칙을 확인하세요.

## 라이센스

이 프로젝트는 ISC 라이센스 하에 배포됩니다. 자세한 내용은 LICENSE 파일을 참조하세요.

---

© 2023 BeensLab. All Rights Reserved.
