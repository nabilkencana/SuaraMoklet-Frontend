const fs = require('fs');
const ts = require('typescript');
const code = fs.readFileSync('components/dashboard/AdminDashboard.tsx', 'utf8');
const result = ts.transpileModule(code, { compilerOptions: { jsx: ts.JsxEmit.React } });
console.log(result.diagnostics);
