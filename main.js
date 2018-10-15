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
var chiaotzu; //チャオズ
var napaNum = 6; // enemyの数
var napaNum2 = 5; // enemyの数
var napaNum3 = 3; // enemyの数
var napaNum4= 1; // enemyの数
var point = 0;
var timeLimit = 20; // 制限時間
var time;
var senzuBtn;
var isSenzu;
var bagetabulletGroup;

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
    
    if(point>1000){
    this.senzuBtn.visible = true;
    }
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
    if(timeCount <= 0 ){
      
      //SoundManager.stopMusic();
      this.exit();
      if(point > 3500){
        //this.exit();
        
        
      } else if(point >= 3000 && point < 3500){
        //self.exit('result',{score:point,message:'テンさんを助けてくれてありがとう！'});
      } else if(point >= 2000 && point < 3000){
        //self.exit('result',{score:point,message:'あと少しだ！がんばれチョアズ！'});
      } else if(point >= 1000 && point < 2000){
        //self.exit('result',{score:point,message:'サイバイマン以下だな！クズ野郎！'});
      } else if(point > 0 && point < 1000){

        //self.exit('result',{score:point,message:'ラディッツ以下だな！！残業詐欺すんな！'});
      } else if(point < 0) {
        //SoundManager.play('oitekita');
        //self.exit('result',{score:point,message:'テンさんを殺してんじゃねえよ！！'});
      } else  {
        //self.exit('result',{score:point,message:'やる気あんのかよ！！'});
      }
    }
    
    
  },
  
  // タッチ判定がtrueの時にタッチされたら実行される処理
  onpointstart: function(e) {
    //SoundManager.play('bgmDodo');
    

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


// MainScene クラスを定義
phina.define('Scene02', {
  
  // DisplaySceneクラスを継承
  superClass: 'DisplayScene',
  
  // コンストラクタ
  init: function() {
    
    // 親クラス初期化
    this.superInit();
    
    // BGM
    SoundManager.playMusic('bgm2');
    
    // 背景
    Sprite('bg').addChildTo(this).setPosition(this.gridX.center(), this.gridY.center());
    
    // ゲージサンプル
    this.value1 = 100;
    this.gauge1 = Gauge({
      x: 320, y: 50,        // x,y座標
      width: 450,            // 横サイズ
      height: 30,            // 縦サイズ
      cornerRadius: 10,      // 角丸み
      maxValue: 100,         // ゲージ最大値
      value: this.value1,         // ゲージ初期値
      fill: 'white',         // 後ろの色
      gaugeColor: 'skyblue', // ゲージ色
      stroke: 'silver',      // 枠色
      strokeWidth: 5,        // 枠太さ
    }).addChildTo(this);
    
        // ゲージサンプル
    this.value2 = 100;
    this.gauge2 = Gauge({
      x: 320, y: 910,        // x,y座標
      width: 250,            // 横サイズ
      height: 30,            // 縦サイズ
      cornerRadius: 10,      // 角丸み
      maxValue: 100,         // ゲージ最大値
      value: this.value2,         // ゲージ初期値
      fill: 'white',         // 後ろの色
      gaugeColor: 'skyblue', // ゲージ色
      stroke: 'silver',      // 枠色
      strokeWidth: 5,        // 枠太さ
    }).addChildTo(this);
    
    this.gauge1.onempty = function(){
      //this.exit();
    }; // 空になった時
    
    this.gauge2.onempty = function(){
      SoundManager.play('kitanehanabi');
    }; // 空になった時
    
    // ベジータを追加
    this.bagetaGroup = DisplayElement().addChildTo(this);
    Begeta(0,100,8).addChildTo(this.bagetaGroup);
    
    // チャオズを追加
    chiaotzu = Chiaotzu().addChildTo(this);
    
    // ドドンパグループ作成
    this.bulletGroup = DisplayElement().addChildTo(this);
        // ドドンパグループ作成
    this.bagetabulletGroup = DisplayElement().addChildTo(this);
  },
  
    //update時の処理
  update: function(app) {
    
        // ドドンパの当たり判定
    this.hitBegetaBullet();
    this.hitChiaotzuBullet();
    this.bagetaGroup.children.each(function(bageta) {
    if(bageta.x > 600){
      bageta.x =0;
    }
    });
  },
  
  // ベジータとビームの当たり判定
  hitBegetaBullet: function() {
    var self = this;
    this.bagetaGroup.children.each(function(bageta) {
    self.bulletGroup.children.each(function(bullet) {
        var c1 = Circle(bageta.x,bageta.y,40);
        var c3 = Circle(bullet.x,bullet.y,20);
        // 円判定
        if (Collision.testCircleCircle(c1,c3)) {
          //SoundManager.play('sayonaraten');
          bullet.remove();
          var value;
          value = self.gauge1.value - 5;
          self.gauge1.value = value;
        }
    });
  });
  },
  
    // ベジータとビームの当たり判定
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
          value = self.gauge2.value - 20;
          self.gauge2.value = value;
        }
    });
  },
  
    // タッチ判定がtrueの時にタッチされ終わったときに実行される処理
  onpointend: function(e) {
         bul2= Bullet_Bageta('chiaotzu_bullet',30,30);
    bul2.addChildTo(this.bagetabulletGroup).setPosition(200,400);
     bul= Bullet('chiaotzu_bullet',30,30);
     bul.addChildTo(this.bulletGroup).setPosition(chiaotzu.x,chiaotzu.y);
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
  
    //onpointend時の処理
  onpointend: function(app){

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

//ベジータクラスを定義
phina.define('Begeta', {
  
  //Spriteクラスを継承
  superClass: 'Sprite',
  
  //コンストラクタ
  init: function(setPositionX, setPositionY,moveSpeed) {
    this.superInit('begeta', 200, 400);//親クラス初期化
    this.setPosition(setPositionX, setPositionY);//位置をセット
    this.setOrigin(0.5, 0); //y座標の基準点を一番上に
    this.physical.velocity.x = moveSpeed; // 移動方向＆いスピード
  },
  
  //update時の処理
  update: function(app) {


  }
  
});

// ベジータビームクラス
phina.define('Bullet_Bageta',{
  
  superClass: 'Sprite',
  
  init:function(image,player_x,player_y){
    this.superInit(image,player_x,player_y);
    this.physical.velocity.y = 15;
  },
  
  //update時の処理
  update: function(){
    //if (this.top < 0) {
    //  this.remove();
    //}
  },
  
});
// メイン処理
phina.main(function() {
  
  // アプリケーション生成
  var app = GameApp({
    //title: '天さん死なないで',
    // メインシーンから開始する
    //startLabel: location.search.substr(1).toObject().scene || 'title', 
        scenes: [
      {
        className: 'Scene01',
        label: 'scene01',
        nextLabel: 'scene02',
      },
      {
        className: 'Scene02',
        label: 'scene02',
        nextLabel: 'scene01',
      },
    ],
    startLabel: 'scene01',
    width: SCREEN_WIDTH,     // スクリーンの横幅
    height: SCREEN_HEIGHT,   // スクリーンの縦幅
    backgroundColor: '#444', // スクリーンの背景色
    autoPause: true,         // 初期ポーズをするか
    debug: false,            // デバッグモードにするか
    fps: 60,                 // 1秒間に画面を更新する回数
    assets: ASSETS         //アセット
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
