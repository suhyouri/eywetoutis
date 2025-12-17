const fs = require('fs');
const path = require('path');

const imagesDir = './images';

if (!fs.existsSync(imagesDir)) {
  console.error('❌ images 폴더가 없습니다!');
  process.exit(1);
}

const files = fs.readdirSync(imagesDir);

const imageFiles = files.filter(file => {
  const ext = path.extname(file).toLowerCase();
  return ['.png', '.jpg', '.jpeg'].includes(ext);
});

imageFiles.sort();

fs.writeFileSync('files.json', JSON.stringify(imageFiles, null, 2));

console.log(`✅ ${imageFiles.length}개의 파일 목록을 files.json에 저장했습니다.`);
console.log('파일 목록:', imageFiles);