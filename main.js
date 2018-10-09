// phina.js をグローバル領域に展開
phina.globalize();

//アセット
var ASSETS = {
  image: {
     map: 'https://rawgit.com/shioleap/tomapiko-action/master/assets/map.png',
     chiaotzu: 'https://i.imgur.com/GfapwLa.png',
     ten: 'https://i.imgur.com/0ZWrzH8.png',
     napa: 'https://i.imgur.com/yUhJBHy.png',
     napa2: 'https://i.imgur.com/CR1xxDT.png',
     napa3: 'https://i.imgur.com/t8asDrF.png',
     napa4: 'https://i.imgur.com/ieUGEJU.png',
     chiaotzu_bullet:' https://i.imgur.com/KvisS15.png',
     bg: 'https://i.imgur.com/8ioMgMn.png'
  },
   sound: {
    'bgm': 'https://rawgit.com/alkn203/phina_js_tips/master/assets/sounds/bgm_maoudamashii_8bit25.mp3',
  },
};

var SCREEN_WIDTH  = 640;
var SCREEN_HEIGHT = 960;
var CHIAOTZU_TOP = 800;
var chiaotzu; //チャオズ
var napaNum = 6; // enemyの数
var napaNum2 = 5; // enemyの数
var napaNum3 = 3; // enemyの数
var napaNum4= 1; // enemyの数
var point = 0;
var timeLimit = 20; // 制限時間
var time;

// MainScene クラスを定義
phina.define('MainScene', {
  // DisplaySceneクラスを継承
  superClass: 'DisplayScene',
  // コンストラクタ
  init: function() {
    // 親クラス初期化
    this.superInit();
    // BGM
    SoundManager.playMusic('bgm');
    // 背景
    Sprite('bg').addChildTo(this).setPosition(this.gridX.center(), this.gridY.center());
    // ポイント表示ラベル
    point = 0
    this.label_point = Label({text: '', fontSize: 30, fill: '#FFFFFF',}).addChildTo(this).setPosition(400,25);
    // 残り時間表示
    time = 0;
    this.label_time = Label({text: '',fontSize: 30,fill: '#FFFFFF',}).addChildTo(this).setPosition(100,25);
    // チャオズを追加
    chiaotzu = Chiaotzu().addChildTo(this);
    // ドドンパグループ作成
    this.bulletGroup = DisplayElement().addChildTo(this);
    // 天津飯を追加
    this.tenGroup = DisplayElement().addChildTo(this);
    Ten(0,300,8).addChildTo(this.tenGroup);
    Ten(0,500,3).addChildTo(this.tenGroup);
    // 敵グループ(ナッパ)作成
    this.enemyGroup = DisplayElement().addChildTo(this);
    for(let i = 1;i <= napaNum;i++){
       this.generateNapa(100*i,600,'napa',100,-3);
    }
    for(let i = 1;i <= napaNum2;i++){
       this.generateNapa(150*i,400,'napa2',200,-6);
    }
    for(let i = 1;i <= napaNum3;i++){
       this.generateNapa(200*i,200,'napa3',300,-9);
    }
        for(let i = 1;i <= napaNum4;i++){
       this.generateNapa(250*i,50,'napa4',1000,-20);
    }
  },
  
  // 敵生成処理
  generateNapa: function(player_x,player_y,level,point,moveSpeed) {
    Napa(player_x,player_y,level,point,moveSpeed).addChildTo(this.enemyGroup);
  },
  
  // ナッパとビームの当たり判定
  hitNapaBullet: function() {
    var self = this;
    // 敵をループ
    this.enemyGroup.children.each(function(enemy) {
      self.bulletGroup.children.each(function(bullet) {
        // 判定用の円
        var c1 = Circle(enemy.x,enemy.y,40);
        var c3 = Circle(bullet.x,bullet.y,20); 
        // 円判定
        if (Collision.testCircleCircle(c1,c3)) {
          var enemyPoint = enemy.point;
          //SoundManager.play('se1');
          bullet.remove();
          enemy.remove();
          point += enemyPoint;
        }
      });
    });
  },
  
  // 天津飯とビームの当たり判定
  hitTenBullet: function() {
    var self = this;
    this.tenGroup.children.each(function(ten) {
    self.bulletGroup.children.each(function(bullet) {
        var c1 = Circle(ten.x,ten.y,40);
        var c3 = Circle(bullet.x,bullet.y,20);
               // 円判定
        if (Collision.testCircleCircle(c1,c3)) {
          //SoundManager.play('bgmTen');
          bullet.remove();
          ten.remove();
          point -= 10000;
        }
    });
  });
  },
  
  //update時の処理
  update: function(app) {
    
    // timeカウント
    time += app.deltaTime;
    var timed = Math.floor(time / 1000);
    timeCount = timeLimit - timed;
    this.label_time.text = '残り時間：' + timeCount;
    
    // ドドンパの当たり判定
    this.hitNapaBullet();
    this.hitTenBullet();
    
    // 移動判定
    this.enemyGroup.children.each(function(enemy) {
      //enemy.rotation -= 1;
      if(enemy.level==='napa'){
        if(enemy.x < 0){
          enemy.x =600;
        }
      }
      if(enemy.x < 0){
        enemy.x =600;
      }
    });
    
    this.tenGroup.children.each(function(ten) {
    //ten.x += 5;
    if(ten.x > 600){
      ten.x =0;
    }
    });
    
    // ポイント更新
    this.label_point.text = point;
    
    var self = this;
    if(timeCount <= 0){
      if(point > 3000){
        self.exit('result',{score:point,message:'テンさんを助けてくれてありがとう！！'});
      } else if(point > 2000 && point <= 3000){
        self.exit('result',{score:point,message:'あと少しだ！！がんばれチョアズ！！'});
      } else if(point > 1000 && point <= 2000){
        self.exit('result',{score:point,message:'サイバイマン以下だな！！まだまだ修業がたりないな！！'});
      } else if(point > 0 && point <= 1000){
        self.exit('result',{score:point,message:'ラディッツ以下だな！！まだまだ修業がたりないな！！'});
      } else if(point < 0) {
        self.exit('result',{score:point,message:'テンさんを殺してんじゃねえよ！！'});
      } else  {
        self.exit('result',{score:point,message:'やる気あんのかよ！！'});
      }
    }
    
  },
  
  // タッチ判定がtrueの時にタッチされたら実行される処理
  onpointstart: function(e) {
    //SoundManager.play('bgmDodo');
    Bullet().addChildTo(this.bulletGroup).setPosition(chiaotzu.x,chiaotzu.y);
  },
  
  // タッチ判定がtrueの時にタッチされ終わったときに実行される処理
  onpointend: function() {
  }
  
});


//チャオズクラスを定義
phina.define('Chiaotzu', {
  //Spriteクラスを継承
  superClass: 'Sprite',
  //コンストラクタ
  init: function() {
    //親クラス初期化
    this.superInit('chiaotzu', 64, 64);
    // タッチ可能にする
    this.setInteractive(true); 
    //位置をセット
    this.setPosition(SCREEN_WIDTH / 6,SCREEN_HEIGHT / 6);
    //y座標の基準点を一番上に
    this.setOrigin(0.5, 0);
    //左右反転
    this.scaleX = -1;
  },
  //update時の処理
  update: function(app) {
    //　移動処理
    var p = app.pointer;
    this.x = p.x;
    this.y = p.y;
    
    // 画面外はみ出し判定
    if (this.left < 0) {
      this.left = 0;
      this.physical.velocity.x *= -1;
    }else if (this.right > SCREEN_WIDTH) {
      this.right = SCREEN_WIDTH;
      this.physical.velocity.x *= -1;
    }
    
    if (this.top < CHIAOTZU_TOP) {
      this.top = CHIAOTZU_TOP;
      this.physical.velocity.y *= -1;
    }else if (this.bottom > SCREEN_HEIGHT) {
      this.bottom = SCREEN_HEIGHT;
      this.physical.velocity.y *= -1;
    }
  }
  
});

// チャオズビームクラス
phina.define('Bullet',{
  superClass: 'Sprite',
  init:function(player_x,player_y){
    this.superInit('chiaotzu_bullet',30,30);
    this.physical.velocity.y = -12;
  },
  //update時の処理
  update: function(){
    if (this.top < 0) {
      this.remove();
    }
  }
});

//天津飯クラスを定義
phina.define('Ten', {
  //Spriteクラスを継承
  superClass: 'Sprite',
  //コンストラクタ
  init: function(setPositionX, setPositionY,moveSpeed) {
    this.superInit('ten', 64, 64);//親クラス初期化
    this.setPosition(setPositionX, setPositionY);//位置をセット
    this.setOrigin(0.5, 0); //y座標の基準点を一番上に
    this.scaleX = -1;//左右反転
    this.physical.velocity.x = moveSpeed; // 移動方向＆いスピード
  },
  //update時の処理
  update: function(app) {
  }
});

//ナッパクラスを定義
phina.define('Napa', {
  
  //Spriteクラスを継承
  superClass: 'Sprite',
      //コンストラクタ
      init: function(setPositionX, setPositionY,level,point,moveSpeed) {
      this.superInit(level, 90, 90);//親クラス初期化
      this.setPosition(setPositionX, setPositionY);//位置をセット(X,Y)
      this.setOrigin(0.5, 0);//y座標の基準点を一番上に
      this.point = point;
      this.physical.velocity.x = moveSpeed;
      this.level = level;
    },
    //update時の処理
    update: function(app) {
    }
});

// メイン処理
phina.main(function() {
  
  // アプリケーション生成
  var app = GameApp({
    title: '天さん死なないで',
    // メインシーンから開始する
    startLabel: location.search.substr(1).toObject().scene || 'title', 
    width: SCREEN_WIDTH,     // スクリーンの横幅
    height: SCREEN_HEIGHT,   // スクリーンの縦幅
    backgroundColor: '#444', // スクリーンの背景色
    autoPause: true,         // 初期ポーズをするか
    debug: false,            // デバッグモードにするか
    fps: 30,                 // 1秒間に画面を更新する回数
    assets: ASSETS         //アセット
  });
  
  // アプリケーション実行
  app.run();
});
