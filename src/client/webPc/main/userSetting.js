import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { Motion, spring } from 'react-motion';
import moment from 'moment';
import pureRenderMixin from 'react-addons-pure-render-mixin';

import './userSetting.scss';

import ui from '../../action/pc';
import user from '../../action/user';
import Avatar from '../../common/avatar';

class UserSetting extends React.Component {
    static propTypes = {
        show: PropTypes.bool.isRequired,
        userInfo: PropTypes.object.isRequired,
    };

    static contextTypes = {
        router: React.PropTypes.object.isRequired,
    }

    constructor(props) {
        super(props);
        this.state = {
            avatarHover: false,
            editStatus: false,
        };
        this.shouldComponentUpdate = pureRenderMixin.shouldComponentUpdate.bind(this);
        this.handleCloseClick = this.handleCloseClick.bind(this);
        this.handleSelectImage = this.handleSelectImage.bind(this);
        // this.handleLogoutClick = this.handleLogoutClick.bind(this);
        this.handleEdit = this.handleEdit.bind(this);
        this.handleOk = this.handleOk.bind(this);
    }

    handleCloseClick() {
        ui.closeUserSetting();
        ui.closeMaskLayout();
    }

    handleSelectImage() {
        const image = this.image.files[0];
        if (!image) {
            return;
        }
        const reader = new FileReader();
        reader.onloadend = function () {
            user.updateAvatar(this.result).then(response => {
                if (response.status === 200) {
                    ui.closeUserSetting();
                    ui.closeMaskLayout();
                }
            });
        };
        reader.readAsDataURL(image);
    }

    // handleLogoutClick() {
    //     user.logout().then(response => {
    //         if (response.status === 204) {
    //             this.context.router.push('/login');
    //             window.localStorage.removeItem('token');
    //             user.init();
    //         }
    //     });
    // }

    handleEdit() {
        this.setState({ editStatus: true });
    }

    handleOk() {
        this.setState({ editStatus: false });
    }

    handleUrl(url) {
        if (url && !/^http/.test(url)) {
            return `http://${url}`;
        }
        return url;
    }

    render() {
        const { show, userInfo } = this.props;
        const username = userInfo.get('username') || '';
        const avatar = userInfo.get('avatar');
        const gender = userInfo.get('gender') || 'male';
        let createdDays = (Date.now() - new Date(userInfo.get('createTime')).getTime()) / (1000 * 60 * 60 * 24);
        if (createdDays > 365) {
            createdDays = `${parseInt(createdDays / 365, 10)}年`;
        }
        else {
            createdDays = `${parseInt(createdDays, 10)}天`;
        }
        const location = userInfo.get('location') || '未知';
        const otherInfos = [
            { key: 'github', value: this.handleUrl(userInfo.get('github')), icon: '&#xe61b;' },
            { key: 'website', value: this.handleUrl(userInfo.get('website')), icon: '&#xe617;' },
            { key: 'qq', value: `tencent://message/?uin=${userInfo.get('qq')}`, icon: '&#xe61a;' },
        ];

        return (
            <Motion
                defaultStyle={{ scale: 0.4, opacity: 0 }}
                style={{ scale: spring(show ? 1 : 0.4), opacity: spring(show ? 1 : 0) }}
            >
                {
                ({ scale, opacity }) => (
                    <div
                        className="user-setting"
                        style={{ opacity, transform: `scale(${scale})`, display: opacity === 0 ? 'none' : 'flex' }}
                    >
                        <div>
                            <i
                                className="icon"
                                onClick={this.handleCloseClick}
                            >&#xe603;</i>
                            <div
                                className="background-image"
                                style={{ backgroundImage: `url('${/^http/.test(avatar) ? avatar : 'http://assets.suisuijiang.com/user_avatar_default.png'}')` }}
                            />
                            <div className="background-mask" />
                            <div className="content">
                                <Avatar
                                    width={80}
                                    height={80}
                                    avatar={avatar}
                                    name={username}
                                    onClick={() => this.image.click()}
                                    onMouseEnter={() => this.setState({ avatarHover: true })}
                                    onMouseLeave={() => this.setState({ avatarHover: false })}
                                />
                                <span>碎碎酱</span>
                                <div className="icon-list">
                                    {
                                        otherInfos.map((o, index) => (
                                            o.value ?
                                                <a
                                                    key={index}
                                                    className="icon"
                                                    title={o.key}
                                                    href={o.value}
                                                    rel="noopener noreferrer"
                                                    target="_blank"
                                                    dangerouslySetInnerHTML={{ __html: o.icon }}
                                                    style={o.key === 'website' ? { position: 'relative', top: 3 } : {}}
                                                />
                                            : null
                                        ))
                                    }
                                </div>
                                { this.state.avatarHover ? <div className="avatar-mask icon">&#xe615;</div> : null }
                                <input
                                    type="file"
                                    ref={image => this.image = image}
                                    accept="image/*"
                                    onChange={this.handleSelectImage}
                                />
                            </div>
                        </div>
                        {
                            this.state.editStatus ?
                                <div className="edit-status">
                                    <div>
                                        <div>
                                            <div>
                                                <span>性别:</span>
                                                <span>出生日期:</span>
                                                <span>位置:</span>
                                                <span>个人网站:</span>
                                                <span>github:</span>
                                                <span>qq:</span>
                                            </div>
                                            <div>
                                                <select defaultValue={gender}>
                                                    <option value="male">男</option>
                                                    <option value="female">女</option>
                                                </select>
                                                <input type="date" defaultValue={moment(userInfo.get('birthday')).format('YYYY-MM-DD')} />
                                                <input type="text" defaultValue={userInfo.get('location')} />
                                                <input type="url" defaultValue={userInfo.get('website')} />
                                                <input type="url" defaultValue={userInfo.get('github')} />
                                                <input type="text" defaultValue={userInfo.get('qq')} />
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <button
                                            onClick={this.handleOk}
                                        >确定</button>
                                    </div>
                                </div>
                            :
                                <div className="normal-status">
                                    <div>
                                        <div>
                                            <div>
                                                <span>性别:</span>
                                                <span>年龄:</span>
                                                <span>时长:</span>
                                                <span>位置:</span>
                                            </div>
                                            <div>
                                                <span>{userInfo.get('gender') === 'male' ? '男' : '女'}</span>
                                                <span>{(1 + new Date().getFullYear()) - new Date(userInfo.get('birthday')).getFullYear()}</span>
                                                <span>{createdDays}</span>
                                                <span>{location}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <button
                                            onClick={this.handleEdit}
                                        >编辑</button>
                                    </div>
                                </div>
                        }
                    </div>
                )
            }
            </Motion>
        );
    }
}

export default connect(
    state => ({
        show: state.getIn(['pc', 'showUserSetting']),
        userInfo: state.get('user'),
    })
)(UserSetting);
