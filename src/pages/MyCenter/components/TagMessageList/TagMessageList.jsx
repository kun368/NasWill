import React, { Component } from 'react';
import { Tab, Feedback } from '@icedesign/base';
import IceContainer from '@icedesign/container';
import './TagMessageList.scss';
import NebPay from 'nebpay';
import { Base64 } from 'js-base64';


const Toast = Feedback.toast;
const nebPay = new NebPay();

const dappAddress = "n1vgZU7fDxQgjKkeB4W2mXd8UYRhj9jQN9a";


export default class TagMessageList extends Component {
  static displayName = 'TagMessageList';

  constructor(props) {
    super(props);
    this.state = {
      dataSourceSend: [],
      dataSourceRecv: []
    };
  }

  checkInstalledPlugin = () => {
    return typeof(webExtensionWallet) !== 'undefined';
  };

  componentDidMount() {
    if (!this.checkInstalledPlugin()) {
      Toast.error('还未安装Chrome扩展，请点击页面上方的下载按钮');
      return;
    }
    const contract = {
      function: 'queryMy',
      args: `[]`,
    };
    Toast.loading("正在获取您的遗嘱数据");
    nebPay.simulateCall(dappAddress, '0', contract.function, contract.args, {
      qrcode: {
        showQRCode: false,
      },
      listener: (resp) => {
        if (resp.execute_err !== "") {
          Toast.error("获取数据失败: " + resp.execute_err);
          return;
        }
        const item = JSON.parse(resp.result);
        console.log(item);
        this.setState({
          dataSourceSend: item.send.arr,
          dataSourceRecv: item.recv.arr,
        });
        Toast.success("获取遗嘱数据成功");
      },
    });
  }

  renderItem = (item, idx, type) => {
    return (
      <div key={idx} style={styles.articleItem}>
        <div>
          <div style={styles.title}>
            立嘱人：{ item.author }
          </div><br/>

          <div style={styles.title}>
            标题：{ item.title }
          </div><br/>

          <div style={styles.title}>
            时间：{ new Date(item.createTime).toLocaleString() }
          </div><br/>

          <div style={styles.title}>
            发送者：{ item.sendAddr }
          </div><br/>

          <div style={styles.title}>
            接收者：{ item.recvAddrs.join(", ") }
          </div><br/>
        </div>
        <div>
          {Base64.decode(item.content).split('\n').map((item, i) => {
            return (
              <p style={styles.desc} key={i}>{ item }</p>
            )
          })}
        </div>
      </div>
    );
  };

  render() {
    return (
      <div className="tag-message-list">
        <IceContainer>
          <Tab size="small">
            <Tab.TabPane key={0} tab={`我发送的遗嘱（${this.state.dataSourceSend.length}）`}>
              {this.state.dataSourceSend.map((item, idx) => {
                return this.renderItem(item, idx, 0)
              })}
            </Tab.TabPane>
            <Tab.TabPane key={1} tab={`我收到的遗嘱（${this.state.dataSourceRecv.length}）`}>
              {this.state.dataSourceRecv.map((item, idx) => {
                return this.renderItem(item, idx, 1)
              })}
            </Tab.TabPane>
          </Tab>
        </IceContainer>
      </div>
    );
  }
}

const styles = {
  allMessage: {
    marginTop: '20px',
    textAlign: 'center',
  },
  item: {
    borderBottom: '1px solid #F4F4F4',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: '15px 0',
  },
  title: {
    fontSize: '14px',
    lineHeight: '14px',
    color: '#666',
  },
  date: {
    fontSize: '12px',
    color: '#666',
  },
  desc: {
    lineHeight: '14px',
    fontSize: '14px',
    color: '#999',
  },
  articleItem: {
    marginBottom: '15px',
    paddingBottom: '15px',
    borderBottom: '1px solid #f5f5f5',
  },
};
