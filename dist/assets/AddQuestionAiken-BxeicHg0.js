import{r as l,j as e,K as y,al as N,N as b,x as w,B as A}from"./index-C8FLH89x.js";import{u as v}from"./index-DxsBjPqq.js";import{p as E}from"./aikenParser-D2gryyxM.js";import"./tslib.es6-BYppDQt_.js";function R({onSuccess:p,onError:x,setModalClose:i,id:h}){const[n,m]=l.useState(null),[c,d]=l.useState(!1),[r,u]=l.useState([]),{getRootProps:f,getInputProps:g}=v({onDropAccepted:async s=>{const a=s[0];m(a);try{const t=await a.text(),o=E(t);u(o)}catch(t){console.error(t),alert("Invalid Aiken format")}},onDropRejected:s=>{s.forEach(a=>{console.log(`${a.file.name} has an invalid MIME type.`)})},accept:{"text/plain":[".txt"]}}),j=async()=>{if(r.length){d(!0);try{await w.post(`${A}/api/admin/quiz/add/questions`,{quizId:h,data:r},{headers:{"Content-Type":"application/json"},withCredentials:!0}),p(),i(!0)}catch(s){console.error(s),x()}finally{d(!1)}}};return e.jsx("div",{className:"h-screen w-screen bg-opacity-25 px-36 py-24 bg-black fixed top-0 left-0 z-[2099]",children:e.jsxs("div",{className:"rounded-md relative h-full w-full transition-all ease-linear duration-300 bg-white overflow-y-auto",children:[e.jsx("div",{className:"flex justify-end",children:e.jsx(y,{onClick:()=>i(!0),children:e.jsx(N,{})})}),e.jsxs("div",{className:"mt-6 bg-green-50 border border-green-300 rounded-md p-4",children:[e.jsx("h2",{className:"text-base font-semibold mb-2",children:"Expected Aiken Format Example:"}),e.jsx("pre",{className:"bg-white text-xs rounded-md p-3 overflow-x-auto whitespace-pre-wrap",children:`What is the capital of France?
A. London
B. Berlin
C. Madrid
D. Paris
ANSWER: D
MARKS: 2
NEGATIVE: 0.5

Which of the following are fruits?
A. Apple
B. Carrot
C. Banana
D. Mango
ANSWER: A,C,D
MARKS: 3
NEGATIVE: 1

Define gravity.
ANSWER: Gravity is the force that attracts a body toward the center of the earth.
MARKS: 5
NEGATIVE: 0`})]}),e.jsxs("section",{className:"p-5 gap-5",children:[e.jsxs("div",{className:"p-10 cursor-pointer flex-1 flex justify-center border-dashed border-2 border-black",...f(),children:[e.jsx("input",{...g()}),n?e.jsx("small",{children:n.name}):e.jsx("small",{children:"Upload here (Only .txt in Aiken format)"})]}),r.length>0&&e.jsxs("div",{className:"mt-4 bg-gray-100 rounded-md p-4 max-h-[400px] overflow-y-auto",children:[e.jsx("h2",{className:"text-lg font-semibold mb-2",children:"Preview Questions:"}),e.jsx("ul",{className:"space-y-4 text-sm",children:r.map((s,a)=>e.jsxs("li",{className:"bg-white rounded-md p-3 shadow-sm",children:[e.jsxs("p",{children:[e.jsxs("strong",{children:["Q",a+1,":"]})," ",s.question]}),e.jsxs("p",{className:"text-xs text-gray-600",children:["Category: ",e.jsx("i",{children:s.category})," | Marks: ",s.marks," | Negative: ",s.negative]}),["MCQ","MSQ"].includes(s.category)&&s.options&&e.jsx("ul",{className:"mt-2 list-disc pl-5",children:s.options.map((t,o)=>e.jsxs("li",{className:t.isCorrect?"text-green-600 font-semibold":"",children:[t.text," ",t.isCorrect&&e.jsx("span",{className:"ml-1",children:"✔️"})]},o))}),s.category==="Text"&&s.answer&&e.jsxs("p",{className:"mt-2 text-blue-700",children:[e.jsx("strong",{children:"Answer:"})," ",s.answer]})]},a))})]}),n&&r.length>0&&e.jsx(b,{onClick:j,sx:{marginTop:"10px"},variant:"contained",color:"primary",disabled:c,children:c?"Uploading...":"Validate & Upload"})]})]})})}export{R as default};
