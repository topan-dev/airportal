module.exports=(config,HTML)=>{
    return`
<!DOCTYPE html>
<html lang="zh-CN">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width">
        <title id="title">${config.title} - Airportal</title>
        <link rel="shortcut icon" type="image/x-icon" href="/file/favicon.ico">
        <script src="/file/TopanUI/src/jquery.js"></script>
        <link rel="stylesheet" href="/file/TopanUI/topan.css">
        <script src="/file/TopanUI/topan.js"></script>
        ${config.header}
    </head>
    <body>
        <div class="topan-outer">
            <div class="topan-page">
                <div class="topan-mainpage-auto">
                    <br>
                    ${HTML}
                    <br>
                </div>
                <footer class="topan-footer">
                    <p></p>
                    <p style="text-align: center; color: #555; font-size: 12px;">
                        Worker in ${parseInt(new Date().getTime()-config.startTime)} ms&nbsp;&nbsp;&nbsp;
                        Powered by <a href="https://github.com/topan-dev/airportal">topan-dev/airportal</a>&nbsp;&nbsp;&nbsp;
                        © 2023 <a href="https://github.com/topan-dev/">Topan Development Group</a>
                    </p>
                </footer>
            </div>
        </div>
    </body>
</html>
    `;
};