const server = '/mycloud';
localStorage.setItem('server', server);
function get_status() {
    $.ajax({
        type: 'GET',
        async: false,
        url: server + '/status',
        success: function (data) {
            if (data['code'] === 0) {
                $('#loginback').css('opacity', '0');
                $('#loginback').css('display', 'none');
                $('#dock-box').css('display', 'flex');
                $('#desktop').css('display', 'flex');
                document.body.style.backgroundImage = 'url("img/pictures/' + document.cookie.split('u=')[1].split(';')[0] + '/back.jpg")';
            } else {
                $('#loginback').css('opacity', '1');
                $('#loginback').css('display', 'flex');
                $('#dock-box').css('display', 'none');
                $('#desktop').css('display', 'none');
                document.getElementById('loginback').style.backgroundImage = 'url("img/pictures/undefined/back.jpg")';
            }
        },
        error: function (xhr, status, msg) {
            console.error(msg);
            $('#loginback').css('opacity', '1');
            $('#loginback').css('display', 'flex');
            $('#dock-box').css('display', 'none');
            $('#desktop').css('display', 'none');
            document.getElementById('loginback').style.backgroundImage = 'url("img/pictures/undefined/back.jpg")';
        }
    })
}

function login_sys(evn) {
    evn.id = 'login-after';
    evn.innerText = '登录中...';
    let qwq = window.setInterval(() => {
        if (evn.innerText.match(/\.\.\./)) {
            evn.innerText = '登录中.';
        } else {
            evn.innerText += '.';
        }
    }, 500);
    let c = new Date().getTime().toString();
    let post_data = {
        t: c,
        username: $('#username')[0].value,
        password: parse_pwd($('#password')[0].value, c)
    }
    $.ajax({
        type: 'POST',
        url: server + '/login',
        data: JSON.stringify(post_data),
        contentType: 'application/json',
        success: function (data) {
            if (data['code'] === 0) {
                $('#loginback').addClass('close');
                $('#loginback').css('opacity', '0');
                $('#loginback').css('display', 'none');
                $('#dock-box').css('display', 'flex');
                $('#desktop').css('display', 'flex');
                window.clearInterval(qwq);
                this.onclick = null;
                document.body.style.backgroundImage='url("img/pictures/' + $('#username')[0].value + '/back.jpg")';
            } else {
                $.Toast(data['msg'], 'error');
                window.clearInterval(qwq);
                evn.id = 'login';
                evn.innerText = '登录';
            }
        },
        error: function () {
            $.Toast('请重试 ~', 'error');
            window.clearInterval(qwq);
            evn.id = 'login';
            evn.innerText = '登录';
        }
    })
}

function logout() {
    $.ajax({
        type: 'GET',
        url: server + '/logout',
        success: function (data) {
            if (data['code'] === 0) {
                window.location.reload();
            } else {
                $.Toast(data['msg'], 'error');
            }
        }
    })
}
