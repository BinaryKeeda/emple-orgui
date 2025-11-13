import{r as g,j as t,I as y,ah as b,R as j,x as v,B as w}from"./index-DrrpgQNc.js";import{u as N}from"./index-G2tNxqjJ.js";import"./tslib.es6-BYppDQt_.js";const q=(h,f)=>new Promise((p,r)=>{const a=new FileReader;a.onload=c=>{try{const n=c.target?.result;if(typeof n!="string")return r(new Error("Invalid file content."));const d=JSON.parse(n);if(!Array.isArray(d))return r(new Error("JSON must be an array of questions."));const o=d.map((e,l)=>{if(!e.question||!e.category||typeof e.marks!="number")throw new Error(`Missing fields in question ${l+1}`);const u={quizId:f,question:String(e.question),category:e.category,marks:Number(e.marks),negative:Math.abs(Number(e.negative||0))};if(e.category==="Text"){if(!e.answer||typeof e.answer!="string")throw new Error(`Invalid or missing answer in question ${l+1}`);return{...u,answer:e.answer}}if(e.category==="MCQ"||e.category==="MSQ"){if(!Array.isArray(e.options)||e.options.length<2||e.options.some(m=>typeof m.text!="string"||typeof m.isCorrect!="boolean"))throw new Error(`Invalid options in question ${l+1}`);return{...u,options:e.options}}throw new Error(`Unsupported category '${e.category}' in question ${l+1}`)});p(o)}catch(n){r(n)}},a.onerror=c=>r(c),a.readAsText(h)});function S({onSuccess:h,onError:f,setModalClose:p,id:r}){const[a,c]=g.useState(null),[n,d]=g.useState(!1),[o,e]=g.useState([]),{getRootProps:l,getInputProps:u}=N({onDropAccepted:async s=>{const i=s[0];c(i);try{const x=await q(i,r);e(x)}catch(x){console.error(x),alert("Invalid JSON format")}},onDropRejected:s=>{s.forEach(i=>{console.log(`${i.file.name} has an invalid MIME type.`)})},accept:{"application/json":[".json"]}}),m=async()=>{if(o.length){d(!0);try{const s=await v.post(`${w}/api/admin/quiz/add/questions`,{quizId:r,data:o},{headers:{"Content-Type":"application/json"},withCredentials:!0});console.log(s.data),h(),p(!0)}catch(s){console.error(s),f()}finally{d(!1)}}};return t.jsx("div",{className:"h-screen w-screen bg-opacity-25 px-36 py-24 bg-black fixed top-0 left-0 z-[2099]",children:t.jsxs("div",{className:"rounded-md relative h-full w-full transition-all ease-linear duration-300 bg-white overflow-y-auto",children:[t.jsx("div",{className:"flex justify-end",children:t.jsx(y,{onClick:()=>p(!0),children:t.jsx(b,{})})}),t.jsxs("div",{className:"mt-6 bg-blue-50 border border-blue-300 rounded-md p-4",children:[t.jsx("h2",{className:"text-base font-semibold mb-2",children:"Expected JSON Schema Example:"}),t.jsx("pre",{className:"bg-white text-xs rounded-md p-3 overflow-x-auto whitespace-pre-wrap",children:`[
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
]`})]}),t.jsxs("section",{className:"p-5 gap-5",children:[t.jsxs("div",{className:"p-10 cursor-pointer flex-1 flex justify-center border-dashed border-2 border-black",...l(),children:[t.jsx("input",{...u()}),a?t.jsx("small",{children:a.name}):t.jsx("small",{children:"Upload here (Only .json supported)"})]}),o.length>0&&t.jsxs("div",{className:"mt-4 bg-gray-100 rounded-md p-4 max-h-[300px] overflow-y-auto",children:[t.jsx("h2",{className:"text-lg font-semibold mb-2",children:"Preview Questions:"}),t.jsx("ul",{className:"list-disc pl-5 space-y-2 text-sm",children:o.map((s,i)=>t.jsxs("li",{children:[t.jsxs("strong",{children:["Q",i+1,":"]})," ",s.question," —"," ",t.jsx("i",{children:s.category})," (",s.marks," marks)"]},i))})]}),a&&o.length>0&&t.jsx(j,{onClick:m,sx:{marginTop:"10px"},variant:"contained",color:"primary",disabled:n,children:n?"Uploading...":"Validate & Upload"})]})]})})}export{S as default};
