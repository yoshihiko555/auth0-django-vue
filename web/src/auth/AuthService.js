import auth0 from 'auth0-js'
import EventEmitter from 'eventemitter3'
import router from './../router'

export default class AuthService {
  authenticated = this.isAuthenticated();
  authNotifier = new EventEmitter();

  constructor () {
    this.login = this.login.bind(this)
    this.setSession = this.setSession.bind(this)
    this.logout = this.logout.bind(this)
    this.isAuthenticated = this.isAuthenticated.bind(this)
    this.handleAuthentication = this.handleAuthentication.bind(this)
  }

 // auth0.WebAuth のインスタンスをAPI および Client
 // 資格情報で作る
  auth0 = new auth0.WebAuth({
    domain: 'dev-orr54nx8.us.auth0.com',
    clientID: '3x1dPK62ZBT5bWxC6n2p8XhutjQS8l8P',
    redirectUri: 'http://localhost:8080',
    audience: 'https://django-vue-test.com.br',
    responseType: 'token id_token',
    scope: 'openid profile'
  });

 // このメソッドは Auth0 ログインページが
 // トリガーされる authorize() メソッドを呼び出す
  login () {
    this.auth0.authorize()
  }

 // このメソッドはコールバック URL から認証情報を得るために
 // Auth0 の parseHash() メソッドを呼び出す
  handleAuthentication () {
    this.auth0.parseHash((err, authResult) => {
        console.log(authResult)
      if (authResult && authResult.accessToken && authResult.idToken) {
        this.setSession(authResult)
      } else if (err) {
        console.log(err)
        alert(`Error: ${err.error}. Check the console for further details.`)
      }
      router.replace('/')
    })
  }

  // ユーザーの access\_token、id\_token、および access\_token が
  // ローカル ストレージで期限切れになる時間を格納する
  setSession (authResult) {
    // アクセス トークンが時間切れになる時間を設定し
    const expiresAt = JSON.stringify(
      authResult.expiresIn * 1000 + new Date().getTime()
    )
    localStorage.setItem('access_token', authResult.accessToken)
    localStorage.setItem('id_token', authResult.idToken)
    localStorage.setItem('expires_at', expiresAt)
    this.authNotifier.emit('authChange', { authenticated: true })
  }

  // そのアクセスと ID トークンをローカル ストレージから削除し、
  // authChange イベントを発行し
  logout () {
    localStorage.removeItem('access_token')
    localStorage.removeItem('id_token')
    localStorage.removeItem('expires_at')
    this.authNotifier.emit('authChange', false)
    // ホームルートに移動する
    router.replace('/')
  }

  // そのユーザーが認証されているか確認する
  isAuthenticated () {
    // 現在の時間がアクセストークンの
    // 有効期限を過ぎているかを確認する
    const expiresAt = JSON.parse(localStorage.getItem('expires_at'))
    return new Date().getTime() < expiresAt
  }

  // アクセストークンを得る静的メソッド
  static getAuthToken () {
    return localStorage.getItem('access_token')
  }

  // ユーザー プロファイルを得るメソッド
  getUserProfile (cb) {
    const accessToken = localStorage.getItem('access_token')
    if (accessToken) return this.auth0.client.userInfo(accessToken, cb)
    else return null
  }
}