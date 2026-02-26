/* ============================================
   Gemini API 이미지 생성 스크립트
   클로드 코드 입문 가이드 전자책
   imagen-4.0-generate-001 모델 사용

   실행: node js/generate-images.js
   ============================================ */

const fs = require('fs');
const path = require('path');

// ── .env 파일에서 API 키 읽기 ──
function loadEnv() {
  const envPath = path.join(__dirname, '..', '.env');
  if (!fs.existsSync(envPath)) {
    console.error('오류: .env 파일이 없습니다.');
    process.exit(1);
  }
  const content = fs.readFileSync(envPath, 'utf-8');
  const match = content.match(/GEMINI_API_KEY=(.+)/);
  if (!match) {
    console.error('오류: .env 파일에 GEMINI_API_KEY가 없습니다.');
    process.exit(1);
  }
  return match[1].trim();
}

// ── 이미지 생성 프롬프트 목록 ──
const imagePrompts = [
  {
    name: 'cover.png',
    prompt: 'A modern minimalist ebook cover illustration about Claude Code AI coding assistant. A glowing terminal window floating above a desk with orange accent light rays emanating from it. Code symbols and gear icons orbit around it. Warm orange and dark navy color scheme. Clean flat design, professional digital art. No text.'
  },
  {
    name: 'ch1.png',
    prompt: 'A flat illustration showing the evolution of AI coding tools. Three stages left to right: a simple chatbot bubble, a code editor with AI sidebar, and a glowing autonomous terminal executing commands. Arrows connect each stage showing progression. Warm orange and dark blue palette, clean geometric shapes, educational style. No text.'
  },
  {
    name: 'ch2.png',
    prompt: 'An educational flat illustration comparing a chatbot versus an autonomous coding agent. Left side: a simple chat window with question and answer bubbles. Right side: a terminal window connected to file icons, browser, database, and deployment server with flowing data lines. Split by a versus divider. Warm orange and dark navy colors, clean design. No text.'
  },
  {
    name: 'ch3.png',
    prompt: 'A flat illustration showing five key features of an AI coding tool displayed as floating cards around a central glowing terminal. Cards represent: a globe for internet access, a folder tree for file management, a branching arrow for multi-agent work, a memory chip for context memory, and a shield for safe execution. Warm orange and dark blue palette, professional ebook style. No text.'
  },
  {
    name: 'ch4.png',
    prompt: 'An educational illustration of AI teamwork concept. A central coordinator robot delegates tasks to four specialized smaller robots working simultaneously: one writes code, one searches the web, one reviews documents, one runs tests. Connected by glowing orange lines forming a network. Clean flat design, warm orange and dark navy palette. No text.'
  },
  {
    name: 'ch5.png',
    prompt: 'A flat illustration showing four AI tools being compared on a podium or comparison chart. Four distinct icons representing different AI assistants: a chat bubble, a sparkle star, a rocket, and a glowing terminal. Each stands on columns of different heights showing capability levels. Warm orange and dark blue color scheme, clean professional design. No text.'
  },
  {
    name: 'ch6.png',
    prompt: 'A flat illustration of a content creator workspace powered by AI. A desk with a camera, microphone, and monitor showing a video timeline. A glowing AI terminal assistant helps with subtitle generation, thumbnail creation, and script editing simultaneously. Warm orange and dark navy colors, clean geometric style. No text.'
  },
  {
    name: 'ch7.png',
    prompt: 'A flat illustration of an office worker using AI to automate tasks. A professional desk with spreadsheets, email icons, and report documents. A glowing terminal assistant processes them simultaneously, turning messy papers into organized outputs. Clock showing time saved. Warm orange and dark blue palette, clean design. No text.'
  },
  {
    name: 'ch8.png',
    prompt: 'A flat illustration of a solo entrepreneur with an AI team. One person at a desk surrounded by five glowing AI robot assistants, each handling a different business task: coding a website, managing finances, writing marketing copy, designing graphics, analyzing data. Warm orange and dark navy colors, professional ebook style. No text.'
  },
  {
    name: 'ch9.png',
    prompt: 'A flat illustration of a music creator using AI for production workflow. A desk with headphones, a digital audio workstation on screen, and musical notes floating. A glowing AI terminal assists with distribution setup, metadata tagging, and playlist submission. Warm orange and dark blue palette, clean geometric style. No text.'
  }
];

// ── Gemini API로 이미지 생성 ──
async function generateImage(apiKey, prompt, filename) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-generate-001:predict?key=${apiKey}`;

  const body = {
    instances: [{ prompt }],
    parameters: {
      sampleCount: 1,
      aspectRatio: '16:9',
      personGeneration: 'dont_allow'
    }
  };

  console.log(`  생성 중: ${filename}...`);

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API 오류 (${response.status}): ${errorText}`);
  }

  const data = await response.json();

  if (!data.predictions || data.predictions.length === 0) {
    throw new Error('이미지가 생성되지 않았습니다.');
  }

  const imageData = data.predictions[0].bytesBase64Encoded;
  const outputDir = path.join(__dirname, '..', 'assets', 'images');

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const outputPath = path.join(outputDir, filename);
  fs.writeFileSync(outputPath, Buffer.from(imageData, 'base64'));
  console.log(`  저장 완료: ${outputPath}`);
}

// ── 메인 실행 ──
async function main() {
  console.log('========================================');
  console.log('  클로드 코드 입문 가이드 이미지 생성기');
  console.log('========================================\n');

  const apiKey = loadEnv();
  console.log('API 키 확인 완료.\n');

  let successCount = 0;
  let failCount = 0;

  for (const item of imagePrompts) {
    try {
      await generateImage(apiKey, item.prompt, item.name);
      successCount++;
    } catch (err) {
      console.error(`  실패: ${item.name} — ${err.message}`);
      failCount++;
    }
    // API 속도 제한 방지 (2초 대기)
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  console.log('\n========================================');
  console.log(`  완료! 성공: ${successCount}개, 실패: ${failCount}개`);
  console.log('========================================');
}

main();
