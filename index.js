const express=require('express'),
      app=express();
const {mkdirSync,existsSync,readFileSync,writeFileSync,unlinkSync}=require('fs');
const path=require('path');
const cors=require('cors');
app.use(cors());
const bodyParser=require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));
const cookieParser=require('cookie-parser');
app.use(cookieParser());
const fileSizeLimit=512;
var multer=require('multer');
var uploader=multer({dest: "upload", limits: {fileSize: fileSizeLimit*1024*1024}});
const formidable=require('express-formidable');
app.use(formidable());

const {renderFile}=require('ejs');
const Template=require('./src/lib/template.js');

var getClientIp=(req)=>{
    return req.headers['x-forwarded-for']||
        req.connection.remoteAddress||
        req.socket.remoteAddress||
        req.connection.socket.remoteAddress||'';
};
Date.prototype.format = function(fmt) {
    var o={
       "M+": this.getMonth()+1,
       "d+": this.getDate(),
       "h+": this.getHours(),
       "m+": this.getMinutes(),
       "s+": this.getSeconds(),
       "q+": Math.floor((this.getMonth()+3)/3),
       "S" : this.getMilliseconds()
    };
    if(/(y+)/.test(fmt)){
        fmt=fmt.replace(RegExp.$1,(this.getFullYear()+"").substr(4-RegExp.$1.length));
    }
    for(var k in o)
        if(new RegExp(`(${k})`).test(fmt))
            fmt=fmt.replace(RegExp.$1,(RegExp.$1.length==1)?(o[k]):(("00"+o[k]).substr((""+o[k]).length)));
    return fmt;
}

if(!existsSync('data')){
    mkdirSync('data');
    mkdirSync('data/files');
    writeFileSync('data/user.json',JSON.stringify([],null,"  "));
    writeFileSync('data/file.json',JSON.stringify([],null,"  "));
}

app.all('*',(req,res,next)=>{
    req.body.startTime=new Date().getTime();
    res.set('Access-Control-Allow-Origin','*');
    res.set('Access-Control-Allow-Methods','GET');
    res.set('Access-Control-Allow-Headers','X-Requested-With, Content-Type');
    if ('OPTIONS'==req.method)return res.send(200);
    next();
});

app.get('/',(req,res)=>{
    renderFile("./src/templates/home.html",{},(err,HTML)=>{
        res.send(Template({title: `首页`,
                           header: ``,
                           startTime: req.body.startTime
                          },HTML));
    });
});
app.get('/get',(req,res)=>{
    renderFile("./src/templates/get.html",{},(err,HTML)=>{
        res.send(Template({title: `接收文件`,
                           header: ``,
                           startTime: req.body.startTime
                          },HTML));
    });
});
app.get('/get/:id/detail',(req,res)=>{
    var detail=JSON.parse(readFileSync('./data/file.json','utf8'))[req.params.id];
    if(!detail)return res.sendStatus(404);
    var downname=detail.n.split(".");
    if(downname.length>1)downname=`down.${downname[downname.length-1]}`;
    else downname="down";
    detail.downname=downname;
    detail.d=new Date(detail.d).format("yyyy-MM-dd hh:mm:ss");
    detail.u=new Date(detail.u).format("yyyy-MM-dd hh:mm:ss");
    renderFile("./src/templates/get_detail.html",{code: req.params.id, detail},(err,HTML)=>{
        res.send(Template({title: `文件信息`,
                           header: ``,
                           startTime: req.body.startTime
                          },HTML));
    });
});
app.get('/get/:id/:filename',(req,res)=>{
    var detail=JSON.parse(readFileSync('./data/file.json','utf8'))[req.params.id];
    if(!detail)return res.sendStatus(404);
    var downname=detail.n.split(".");
    if(downname.length>1)downname=`down.${downname[downname.length-1]}`;
    else downname="down";
    if(downname!=req.params.filename)return res.sendStatus(404);
    res.sendFile(`data/files/${detail.f}`,{root:__dirname},err=>{});
});
app.get('/send',(req,res)=>{
    renderFile("./src/templates/send.html",{ip: getClientIp(req)},(err,HTML)=>{
        res.send(Template({title: `发送文件`,
                           header: ``,
                           startTime: req.body.startTime
                          },HTML));
    });
});
app.post('/send',(req,res)=>{
    if(req.fields.password.length>64)return res.json({error: "密码长度不得超过 64 位。"});
    var code="";
    for(var i=0;i<6;i++)
        code+="1234567890"[parseInt(Math.random()*10)];
    var filename=req.files.file.name;
    writeFileSync(`data/files/${code}_${filename}`,readFileSync(req.files.file.path));
    unlinkSync(req.files.file.path,err=>{});
    var filelist=readFileSync(`data/file.json`,'utf8');
    filelist=JSON.parse(filelist);
    var now=new Date().getTime();
    filelist[code]={
        f: `${code}_${filename}`,
        t: req.fields.time,
        n: filename,
        ip: getClientIp(req),
        u: now,
        d: now+req.fields.duration*3600000
    };
    if(req.fields.password.length>0)
        filelist[code].p=req.fields.password;
    writeFileSync(`data/file.json`,JSON.stringify(filelist,null,"  "));
    res.json({code});
});

app.use("/file",express.static(path.join(__dirname,'src/assets')));

app.listen(8799,()=>{
    console.log('Port :8799 is opened');
});