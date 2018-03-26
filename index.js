export default class Ovideo {
    constructor (config) {
        this.config = Object.assign({
            $root: null,
            isAutoPlay: false,
            url: '',
            isPlaysInline: false,
            isShowControl: false,
            onChange: null, // 播放器状态切换回调
        }, config);

        this.Vars = {
            status: {
                playing: 'playing', // 播放中
                pause: 'paused', // 暂定(包括待播放)
                loading: 'loading', // 缓冲中
                ended: 'ended', //播放完成
                error: 'error'
            },
            curState: 'paused'
        };

        this.init();
    }

    isPlaying () {
        return !this.config.$root.find('video')[0].paused;
    }

    canWebkitPlaysinline () {
        try {
            var _ua= navigator.userAgent.toLowerCase(); 
            var ver=_ua.match(/cpu iphone os (\d+)\_(\d+) like/);

            // iOS8微信里面禁止使用webkit-playsinline（会偶先白屏）
            if (!!_ua.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/i) && !!_ua.match(/MicroMessenger/i) && ver && ver[1] && ver[1] == 8) {
                return '';
            } else {
                return 'webkit-playsinline ';
            }
        } catch (e) {
            return 'webkit-playsinline ';
        }
    }

    renderPropsInline () {
        return 'playsinline ' + this.canWebkitPlaysinline();
    }

    render () {
        const htmlStr = `
            <video 
                src="${ this.config.url }"
                class="video"
                ${ (this.config.isAutoPlay && ('autoplay=true')) || '' }
                ${ (this.config.isPlaysInline && (this.renderPropsInline())) || '' }
                ${ (this.config.isShowControl && ('controls="controls"')) || '' }
            >
                <span>您的手机版本，网页版暂未能支持！</span>
            </video>
        `;

        this.config.$root.append(htmlStr);
    }

    play () {
        this.config.$root.find('video')[0].play();
    }

    pause () {
        this.config.$root.find('video')[0].pause();
    }

    // 播放器事件监听
    eventListener (e, callback) {
        this.config.$root.find('video')[0].addEventListener(e, () => {
            callback && callback();
        }, false);

    }
    
    // 播放器事件监听
    bindEvent () {
        // 准备就绪
        this.eventListener('canplay', () => {
            console.log('canplay');
            // this.config.onChange && this.config.onChange(this.Vars.pause);
        });

        // 开始播放
        this.eventListener('playing', () => {
            console.log('playing');
            this.Vars.curState = this.Vars.status.playing;
            this.config.onChange && this.config.onChange(this.Vars.status.playing);
        });

        this.eventListener('waiting', () => {
            console.log('waiting');
            this.Vars.curState = this.Vars.status.loading;
            this.config.onChange && this.config.onChange(this.Vars.status.loading);
        
        });

        
        // 播放暂停
        this.eventListener('pause', () => {
            this.Vars.curState = this.Vars.status.pause;
            this.config.onChange && this.config.onChange(this.Vars.status.pause);
            console.log('pause');
        });

        // 播放结束
        this.eventListener('ended', () => {
            this.Vars.curState = this.Vars.status.ended;
            this.config.onChange && this.config.onChange(this.Vars.status.ended);
        });

        // 播放错误
        this.eventListener('error', () => {
            this.Vars.curState = this.Vars.status.error;
            this.config.onChange && this.config.onChange(this.Vars.status.error);
        });
    }

    init () {
        this.render();
        this.bindEvent();
    }
}
