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
     bg: 'https://i.imgur.com/8ioMgMn.png',
     senzu_bullet: 'https://i.imgur.com/rnbh0NR.png',
     begeta:'https://i.imgur.com/p2LjRUg.png',
     title:'https://i.imgur.com/LiYSBTW.png',
  },
   sound: {
    'bgm': 'https://raw.githubusercontent.com/hirobob/chaozu/master/furueru.aac',
    'bgm2': 'https://raw.githubusercontent.com/hirobob/chaozu/master/sekai.aac',
    'kitanehanabi': 'https://raw.githubusercontent.com/hirobob/chaozu/master/kitanehanabi.aac',
    'sayonaraten':'https://raw.githubusercontent.com/hirobob/chaozu/master/sayonaraten.aac',
    'oitekita':'https://raw.githubusercontent.com/hirobob/chaozu/master/oitekita.aac',
  },
};

var SCREEN_WIDTH  = 640;
var SCREEN_HEIGHT = 960;
var CHIAOTZU_TOP = 800;
var napaNum = 6; // enemyの数
var napaNum2 = 5; // enemyの数
var napaNum3 = 3; // enemyの数
var napaNum4= 1; // enemyの数
var point = 0;
var timeLimit = 20; // 制限時間
var time;
var senzuBtn;
var isSenzu;
var chiaotzu; //チャオズ
var bageta;

// MainScene クラスを定義
phina.define('Scene01', {
  
  // DisplaySceneクラスを継承
  superClass: 'DisplayScene',
  
  // コンストラクタ
  init: function() {
    
    // 親クラス初期化
    this.superInit();
    
    isSenzu = false;
    
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
   
    // ドドンパグループ作成
    this.bulletGroup = DisplayElement().addChildTo(this);

    
    // チャオズを追加
    chiaotzu = Chiaotzu().addChildTo(this);

    // 天津飯を追加
    this.tenGroup = DisplayElement().addChildTo(this);
    Ten(0,300,8).addChildTo(this.tenGroup);
    Ten(0,500,3).addChildTo(this.tenGroup);
    
    // 敵グループ(ナッパ)作成
    this.enemyGroup = DisplayElement().addChildTo(this);
    for(let i = 1;i <= napaNum;i++){
       this.generateNapa(100*i,600,'napa',100,-1);
    }
    for(let i = 1;i <= napaNum2;i++){
       this.generateNapa(120*i,400,'napa2',200,-3);
    }
    for(let i = 1;i <= napaNum3;i++){
       this.generateNapa(200*i,200,'napa3',300,-5);
    }
        for(let i = 1;i <= napaNum4;i++){
       this.generateNapa(250*i,50,'napa4',1000,-10);
    }
    
    // ボタンサンプル
    this.senzuBtn = Button({x: 550, y: 900, width: 150, height: 100,text: "仙豆(バグ)", }).addChildTo(this);
    this.senzuBtn.visible = true;
    this.senzuBtn.onpointend = function(){
      isSenzu = true;
      SoundManager.play('sayonaraten');
    };
    
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
          if(!isSenzu){
            var enemyPoint = enemy.point;
            //SoundManager.play('se1');
            enemy.remove();
            point += enemyPoint;
          } else {
            enemy.scaleX += 0.10;
            enemy.scaleY += 0.10;
          }
          bullet.remove();
        }
      });
    });
  },
  
  // 天津飯とビームの当たり判定
  hitTenBullet: function() {
    var self = this;
    this.tenGroup.children.each(function(ten) {
       //ten.scaleX += 1.01;
      //ten.scaleY += 1.01;
    self.bulletGroup.children.each(function(bullet) {
        var c1 = Circle(ten.x,ten.y,40);
        var c3 = Circle(bullet.x,bullet.y,20);
               // 円判定
        if (Collision.testCircleCircle(c1,c3)) {
          SoundManager.play('sayonaraten');
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
      if(ten.x > 600){
        ten.x =0;
      }
    });
    
    // ポイント更新
    this.label_point.text = point;
    
    // 集計
    if(timeCount <= 0 ){
      
      SoundManager.stopMusic();
      
      if(point > 3500){
        this.exit();
      } else if(point >= 3000 && point < 3500){
        app.replaceScene(EndScene(point,'テンさんを助けてくれてありがとう！'))
      } else if(point >= 2000 && point < 3000){
        app.replaceScene(EndScene(point,'あと少しだ！がんばれチョアズ！'))
      } else if(point >= 1000 && point < 2000){
        app.replaceScene(EndScene(point,'サイバイマン以下だな！クズ野郎！'))
      } else if(point > 0 && point < 1000){
        app.replaceScene(EndScene(point,'ラディッツ以下だな！！残業詐欺すんな！'))
      } else if(point < 0) {
        // SoundManager.play('oitekita');
        this.exit();
        //app.replaceScene(EndScene(point,'テンさんを殺してんじゃねえよ！！'))
      } else  {
        app.replaceScene(EndScene(point,'やる気あんのかよ！！'))
      }
    }
    
  },
  
  // タッチ判定がtrueの時にタッチされたら実行される処理
  onpointstart: function(e) {
  },
  
  // タッチ判定がtrueの時にタッチされ終わったときに実行される処理
  onpointend: function(e) {
     var bul;
     if(isSenzu){
        bul= Bullet('senzu_bullet',30,30);
     } else {
        bul= Bullet('chiaotzu_bullet',30,30);
     }
     //bul.setImage('senzu',30,30);
     bul.addChildTo(this.bulletGroup).setPosition(chiaotzu.x,chiaotzu.y);
  }
  
});


// ステージ2「ベジータ」
phina.define('Scene02', {
  superClass: 'DisplayScene',
  
  // コンストラクタ
  init: function() {
    
    // 親クラス初期化
    this.superInit();
    
    // BGM
    SoundManager.playMusic('bgm2');
    
    // 背景
    Sprite('bg').addChildTo(this).setPosition(this.gridX.center(), this.gridY.center());
    
    this.begeEnetimer = 0;
    
    // ベジータの体力ゲージ
    this.gauge1 = Gauge({
      x: 320, y: 50,         // x,y座標
      width: 500,            // 横サイズ
      height: 15,            // 縦サイズ
      cornerRadius: 10,      // 角丸み
      maxValue: 400,         // ゲージ最大値
      value: 400,            // ゲージ初期値
      fill: 'white',         // 後ろの色
      gaugeColor: 'skyblue', // ゲージ色
      stroke: 'silver',      // 枠色
      strokeWidth: 5,        // 枠太さ
    }).addChildTo(this);
    
    // チャオズの体力ゲージ
    this.gauge2 = Gauge({
      x: 320, y: 910,        // x,y座標
      width: 250,            // 横サイズ
      height: 15,            // 縦サイズ
      cornerRadius: 10,      // 角丸み
      maxValue: 200,         // ゲージ最大値
      value: 200,            // ゲージ初期値
      fill: 'white',         // 後ろの色
      gaugeColor: 'skyblue', // ゲージ色
      stroke: 'silver',      // 枠色
      strokeWidth: 5,        // 枠太さ
    }).addChildTo(this);
    
    
    // ベジータ
    bageta = Begeta(0, 100, 5).addChildTo(this);
    this.bagetabulletGroup = DisplayElement().addChildTo(this);
    
    // チャオズ
    chiaotzu = Chiaotzu().addChildTo(this);
    this.bulletGroup = DisplayElement().addChildTo(this);
  },
  
  //update時の処理
  update: function(app) {
    
    // ベジータのビーム発射
    ++this.begeEnetimer
    if (this.begeEnetimer % 30 === 0) {
      for (var i = 0, n = (this.begeEnetimer / 300); i < n; ++i) {
        var enemy = Bullet_Bageta('chiaotzu_bullet',40,40).addChildTo(this.bagetabulletGroup);
        enemy.x = Math.randint(0, bageta.x);
        enemy.y = bageta.height+bageta.y ;
      }
    }
    
    // ビーム当たり判定
    this.hitBegetaBullet();
    this.hitChiaotzuBullet();
    
    // ベジータゲージが「0」になったとき
    this.gauge1.onempty = function(){
      SoundManager.stopMusic();
      app.replaceScene(EndScene(0,'続き開発中'))
    };
    // チャオズゲージが「0」になったとき
    this.gauge2.onempty = function(){
      SoundManager.stopMusic();
      SoundManager.play('kitanehanabi');
      app.replaceScene(EndScene(-9999999,'D助ぶっ潰す！'))
    };
  },
  
  // ベジータとビームの当たり判定
  hitBegetaBullet: function() {
    var self = this;
    self.bulletGroup.children.each(function(bullet) {
        var c1 = Circle(bageta.x,bageta.y,40);
        var c3 = Circle(bullet.x,bullet.y,20);
        // 円判定
        if (Collision.testCircleCircle(c1,c3)) {
          //SoundManager.play('sayonaraten');
          bullet.remove();
          var value;
          value = self.gauge1.value - 10;
          self.gauge1.value = value;
        }
    });
  },
  
  // チャオズとビームの当たり判定
  hitChiaotzuBullet: function() {
    var self = this;
    self.bagetabulletGroup.children.each(function(bullet) {
        var c1 = Circle(chiaotzu.x,chiaotzu.y,40);
        var c3 = Circle(bullet.x,bullet.y,20);
        // 円判定
        if (Collision.testCircleCircle(c1,c3)) {
          //SoundManager.play('sayonaraten');
          bullet.remove();
          var value;
          value = self.gauge2.value - 10;
          self.gauge2.value = value;
        }
    });
  },
  
  // タッチ判定がtrueの時にタッチされ終わったときに実行される処理
  onpointend: function(e) {
     bul= Bullet('chiaotzu_bullet',30,30);
     bul.addChildTo(this.bulletGroup).setPosition(chiaotzu.x,chiaotzu.y);
  }
  
});

  
// チャオズクラス
phina.define('Chiaotzu', {
  superClass: 'Sprite',
  
  init: function() {
    this.superInit('chiaotzu', 64, 64);
    this.setInteractive(true); // タッチ可能にする
    this.setPosition(SCREEN_WIDTH / 6,SCREEN_HEIGHT / 6);
    this.setOrigin(0.5, 0);    //y座標の基準点を一番上に
    this.scaleX = -1;          //左右反転
  },
  
  update: function(app) {
    
    if(isSenzu){
      return;
    }
    
    //　移動処理
    var p = app.pointer;
    this.x = p.x;
    this.y = p.y;
    
    // 画面外はみ出し判定
    if (this.left < 50) {
      this.left = 50;
      this.physical.velocity.x *= -1;
    }else if (this.right > SCREEN_WIDTH-50) {
      this.right = SCREEN_WIDTH-50;
      this.physical.velocity.x *= -1;
    }
    
    if (this.top < CHIAOTZU_TOP) {
      this.top = CHIAOTZU_TOP;
      this.physical.velocity.y *= -1;
    }else if (this.bottom > SCREEN_HEIGHT) {
      this.bottom = SCREEN_HEIGHT;
      this.physical.velocity.y *= -1;
    }
  },
  
});

// チャオズビームクラス
phina.define('Bullet',{
  superClass: 'Sprite',
  
  init:function(image,player_x,player_y){
    this.superInit(image,30,30);
    this.physical.velocity.y = -8;
  },
  
  //update時の処理
  update: function(){
    if (this.top < 0) {
      this.remove();
    }
  },
  
});

// 天津飯クラス
phina.define('Ten', {
  superClass: 'Sprite',
  
  init: function(setPositionX, setPositionY,moveSpeed) {
    this.superInit('ten', 64, 64);//親クラス初期化
    this.setPosition(setPositionX, setPositionY);//位置をセット
    this.setOrigin(0.5, 0); //y座標の基準点を一番上に
    this.scaleX = -1;//左右反転
    this.physical.velocity.x = moveSpeed; // 移動方向＆いスピード
  },
  
});

// ナッパクラス
phina.define('Napa', {
  superClass: 'Sprite',
  
  init: function(setPositionX, setPositionY,level,point,moveSpeed) {
    this.superInit(level, 90, 90);//親クラス初期化
    this.setPosition(setPositionX, setPositionY);//位置をセット(X,Y)
    this.setOrigin(0.5, 0);//y座標の基準点を一番上に
    this.point = point;
    this.physical.velocity.x = moveSpeed;
    this.level = level;
  },
    
});

// ベジータクラス
phina.define('Begeta', {
  superClass: 'Sprite',

  init: function(setPositionX, setPositionY,moveSpeed) {
    this.superInit('begeta', 125, 250);
    this.setPosition(setPositionX, setPositionY);
    this.setOrigin(0.5, 0);
    this.physical.velocity.x  = moveSpeed; 
  },
  
  //update時の処理
  update: function(app) {
    if(bageta.x > 600){
      bageta.x =0;
    }
  }
  
});

// ベジータビームクラス
phina.define('Bullet_Bageta',{
  superClass: 'Sprite',
  
  init:function(image, player_x, player_y){
    this.superInit(image, player_x, player_y);
    this.physical.velocity.y = 13;
  },
  
});


/**
 * エンド画面
 */
phina.define("EndScene", {
  superClass : "phina.game.ResultScene",

  init : function(point, msg) {
    
    var RESULT_PARAM = {
      score:    point,
      message:  msg,
      hashtags: ["omatoro", "phina.js"],
      url:      "https://github.com/omatoro/phina.js_tutorial_avoidgame/",
      width:    SCREEN_WIDTH,
      height:   SCREEN_HEIGHT,
    };
    
    this.superInit(RESULT_PARAM);
  },

  // Backボタンを押したらTitleSceneに戻る
  onnextscene: function (e) {
    e.target.app.replaceScene(TitleScene());
  },
});

/**
 * タイトル画面
 */
phina.define("TitleScene", {
  superClass : "phina.game.TitleScene",
  
  init: function() {
    this.superInit({
      backgroundColor: 'rgb(20,20,20)',
      width: SCREEN_WIDTH,
      height: SCREEN_HEIGHT,
    });
    
    Sprite('title').addChildTo(this).setPosition(this.gridX.center(), this.gridY.center()+50);
    
    Label({
      text: '天さん死なないで',
      fontSize: 64,
      fill: 'white',
    }).addChildTo(this).setPosition(this.gridX.center(), this.gridY.span(4)-180);
    Label({
      text: '【パーフェクトを達成すると何か起きる！】',
      fontSize: 30,
      fill: 'white',
    }).addChildTo(this).setPosition(this.gridX.center(), this.gridY.span(4)-120);
    Label({
      text: "TOUCH START",
      fontSize: 64,
      fill: 'white',
    }).addChildTo(this).setPosition(this.gridX.center(), this.gridY.span(12)).tweener.fadeOut(1000).fadeIn(500).setLoop(true).play();
  },
  
});

/**
 * メイン処理
 */
phina.main(function() {
  
  // アプリケーション生成
  var app = GameApp({
    scenes: [{className: 'TitleScene', label: 'title', nextLabel: 'scene01',},
             {className: 'Scene01', label: 'scene01', nextLabel: 'scene02',},
             {className: 'Scene02', label: 'scene02', nextLabel: 'scene01',},
            ],
    startLabel: 'title',
    width: SCREEN_WIDTH,     // スクリーンの横幅
    height: SCREEN_HEIGHT,   // スクリーンの縦幅
    backgroundColor: '#444', // スクリーンの背景色
    autoPause: true,         // 初期ポーズをするか
    debug: false,             // デバッグモードにするか
    fps: 60,                 // 1秒間に画面を更新する回数
    assets: ASSETS           // アセット
  });
  
  // iphonで音を出すための対応
  app.domElement.addEventListener('touchend', function dummy() {
    var s = phina.asset.Sound();
    s.loadFromBuffer();
    s.play().stop();
    app.domElement.removeEventListener('touchend', dummy);
  });
  
  // fps表示
  app.enableStats();
  
  // アプリケーション実行
  app.run();
  
});
