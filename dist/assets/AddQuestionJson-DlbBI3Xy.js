import{r as g,j as t,I as y,t as b,B as j}from"./index-C3gQS_fc.js";import{u as v}from"./index-DiMQGTP8.js";import{C as w}from"./UploadFile-MRN9rYWz.js";import{B as N}from"./Button-DB3elE-F.js";import"./tslib.es6-BYppDQt_.js";const q=(h,f)=>new Promise((p,s)=>{const a=new FileReader;a.onload=c=>{try{const o=c.target?.result;if(typeof o!="string")return s(new Error("Invalid file content."));const d=JSON.parse(o);if(!Array.isArray(d))return s(new Error("JSON must be an array of questions."));const n=d.map((e,l)=>{if(!e.question||!e.category||typeof e.marks!="number")throw new Error(`Missing fields in question ${l+1}`);const u={quizId:f,question:String(e.question),category:e.category,marks:Number(e.marks),negative:Math.abs(Number(e.negative||0))};if(e.category==="Text"){if(!e.answer||typeof e.answer!="string")throw new Error(`Invalid or missing answer in question ${l+1}`);return{...u,answer:e.answer}}if(e.category==="MCQ"||e.category==="MSQ"){if(!Array.isArray(e.options)||e.options.length<2||e.options.some(m=>typeof m.text!="string"||typeof m.isCorrect!="boolean"))throw new Error(`Invalid options in question ${l+1}`);return{...u,options:e.options}}throw new Error(`Unsupported category '${e.category}' in question ${l+1}`)});p(n)}catch(o){s(o)}},a.onerror=c=>s(c),a.readAsText(h)});function I({onSuccess:h,onError:f,setModalClose:p,id:s}){const[a,c]=g.useState(null),[o,d]=g.useState(!1),[n,e]=g.useState([]),{getRootProps:l,getInputProps:u}=v({onDropAccepted:async r=>{const i=r[0];c(i);try{const x=await q(i,s);e(x)}catch(x){console.error(x),alert("Invalid JSON format")}},onDropRejected:r=>{r.forEach(i=>{console.log(`${i.file.name} has an invalid MIME type.`)})},accept:{"application/json":[".json"]}}),m=async()=>{if(n.length){d(!0);try{const r=await b.post(`${j}/api/admin/quiz/add/questions`,{quizId:s,data:n},{headers:{"Content-Type":"application/json"},withCredentials:!0});console.log(r.data),h(),p(!0)}catch(r){console.error(r),f()}finally{d(!1)}}};return t.jsx("div",{className:"h-screen w-screen bg-opacity-25 px-36 py-24 bg-black fixed top-0 left-0 z-[2099]",children:t.jsxs("div",{className:"rounded-md relative h-full w-full transition-all ease-linear duration-300 bg-white overflow-y-auto",children:[t.jsx("div",{className:"flex justify-end",children:t.jsx(y,{onClick:()=>p(!0),children:t.jsx(w,{})})}),t.jsxs("div",{className:"mt-6 bg-blue-50 border border-blue-300 rounded-md p-4",children:[t.jsx("h2",{className:"text-base font-semibold mb-2",children:"Expected JSON Schema Example:"}),t.jsx("pre",{className:"bg-white text-xs rounded-md p-3 overflow-x-auto whitespace-pre-wrap",children:`[
  {
    "question": "What is the capital of France?",
    "category": "MCQ",
    "marks": 2,
    "negative": 0.5,
    "options": [
      { "text": "Paris", "isCorrect": true },
      { "text": "London", "isCorrect": false },
      { "text": "Berlin", "isCorrect": false },
      { "text": "Madrid", "isCorrect": false }
    ]
  },
  {
    "question": "Define gravity.",
    "category": "Text",
    "marks": 5,
    "negative": 0,
    "answer": "Gravity is the force that attracts a body toward the center of the earth."
  }
]`})]}),t.jsxs("section",{className:"p-5 gap-5",children:[t.jsxs("div",{className:"p-10 cursor-pointer flex-1 flex justify-center border-dashed border-2 border-black",...l(),children:[t.jsx("input",{...u()}),a?t.jsx("small",{children:a.name}):t.jsx("small",{children:"Upload here (Only .json supported)"})]}),n.length>0&&t.jsxs("div",{className:"mt-4 bg-gray-100 rounded-md p-4 max-h-[300px] overflow-y-auto",children:[t.jsx("h2",{className:"text-lg font-semibold mb-2",children:"Preview Questions:"}),t.jsx("ul",{className:"list-disc pl-5 space-y-2 text-sm",children:n.map((r,i)=>t.jsxs("li",{children:[t.jsxs("strong",{children:["Q",i+1,":"]})," ",r.question," —"," ",t.jsx("i",{children:r.category})," (",r.marks," marks)"]},i))})]}),a&&n.length>0&&t.jsx(N,{onClick:m,sx:{marginTop:"10px"},variant:"contained",color:"primary",disabled:o,children:o?"Uploading...":"Validate & Upload"})]})]})})}export{I as default};
