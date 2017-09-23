//////////////////////////////////////////////////////////////////////////////////////
//
//  Copyright (c) 2014-present, Egret Technology.
//  All rights reserved.
//  Redistribution and use in source and binary forms, with or without
//  modification, are permitted provided that the following conditions are met:
//
//     * Redistributions of source code must retain the above copyright
//       notice, this list of conditions and the following disclaimer.
//     * Redistributions in binary form must reproduce the above copyright
//       notice, this list of conditions and the following disclaimer in the
//       documentation and/or other materials provided with the distribution.
//     * Neither the name of the Egret nor the
//       names of its contributors may be used to endorse or promote products
//       derived from this software without specific prior written permission.
//
//  THIS SOFTWARE IS PROVIDED BY EGRET AND CONTRIBUTORS "AS IS" AND ANY EXPRESS
//  OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES
//  OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED.
//  IN NO EVENT SHALL EGRET AND CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT,
//  INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
//  LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;LOSS OF USE, DATA,
//  OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
//  LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
//  NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
//  EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
//
//////////////////////////////////////////////////////////////////////////////////////
//import position = require("Pos");
var id:number[]=[];//每个点的id
var posx:number[]=[];//每个点的x坐标
var posy:number[]=[];//每个点的y坐标
var red:boolean[]=[];//点是否为红
var tempcatx=0;//每次猫的位置变更时的位置信息x
var tempcaty=0;//每次猫的位置变更时的位置信息y
var tempcatid=40;//每次猫的位置变更时的id
var temppotid=0;//每次玩家点击到的点的id
var count=0;//玩家用的步数
var flag:boolean;//胜利与否的标记
class Main extends egret.DisplayObjectContainer {

    /**
     * 加载进度界面
     * Process interface loading
     */
    private loadingView: LoadingUI;

    public constructor() {
        super();
        this.addEventListener(egret.Event.ADDED_TO_STAGE, this.onAddToStage, this);
        
        
    }

    private onAddToStage(event: egret.Event) {
        //设置加载进度界面
        //Config to load process interface
        this.loadingView = new LoadingUI();
        this.stage.addChild(this.loadingView);

        //初始化Resource资源加载库
        //initiate Resource loading library
        RES.addEventListener(RES.ResourceEvent.CONFIG_COMPLETE, this.onConfigComplete, this);
        RES.loadConfig("resource/default.res.json", "resource/");
    }

    /**
     * 配置文件加载完成,开始预加载preload资源组。
     * configuration file loading is completed, start to pre-load the preload resource group
     */
    private onConfigComplete(event: RES.ResourceEvent): void {
        RES.removeEventListener(RES.ResourceEvent.CONFIG_COMPLETE, this.onConfigComplete, this);
        RES.addEventListener(RES.ResourceEvent.GROUP_COMPLETE, this.onResourceLoadComplete, this);
        RES.addEventListener(RES.ResourceEvent.GROUP_LOAD_ERROR, this.onResourceLoadError, this);
        RES.addEventListener(RES.ResourceEvent.GROUP_PROGRESS, this.onResourceProgress, this);
        RES.addEventListener(RES.ResourceEvent.ITEM_LOAD_ERROR, this.onItemLoadError, this);
        RES.loadGroup("preload");
    }

    /**
     * preload资源组加载完成
     * Preload resource group is loaded
     */
    private onResourceLoadComplete(event: RES.ResourceEvent) {
        if (event.groupName == "preload") {
            this.stage.removeChild(this.loadingView);
            RES.removeEventListener(RES.ResourceEvent.GROUP_COMPLETE, this.onResourceLoadComplete, this);
            RES.removeEventListener(RES.ResourceEvent.GROUP_LOAD_ERROR, this.onResourceLoadError, this);
            RES.removeEventListener(RES.ResourceEvent.GROUP_PROGRESS, this.onResourceProgress, this);
            RES.removeEventListener(RES.ResourceEvent.ITEM_LOAD_ERROR, this.onItemLoadError, this);
            this.createGameScene();
        }
    }

    /**
     * 资源组加载出错
     *  The resource group loading failed
     */
    private onItemLoadError(event: RES.ResourceEvent) {
        console.warn("Url:" + event.resItem.url + " has failed to load");
    }

    /**
     * 资源组加载出错
     *  The resource group loading failed
     */
    private onResourceLoadError(event: RES.ResourceEvent) {
        //TODO
        console.warn("Group:" + event.groupName + " has failed to load");
        //忽略加载失败的项目
        //Ignore the loading failed projects
        this.onResourceLoadComplete(event);
    }

    /**
     * preload资源组加载进度
     * Loading process of preload resource group
     */
    private onResourceProgress(event: RES.ResourceEvent) {
        if (event.groupName == "preload") {
            this.loadingView.setProgress(event.itemsLoaded, event.itemsTotal);
        }
    }

    private textfield: egret.TextField;

    /**
     * 创建游戏场景
     * Create a game scene
     */
    
    private createGameScene() {
        this.bg = this.createBitmapByName("bg_jpg");//初始化
        this.btn_start=this.createBitmapByName("btn_start_png");
        this.victory=this.createBitmapByName("victory_png");
        this.defeat=this.createBitmapByName("failed_png");
        this.again=this.createBitmapByName("replay_png");
        var data = RES.getRes("stay_json");
        var txtr = RES.getRes("stay_png");
        var mcFactory:egret.MovieClipDataFactory = new egret.MovieClipDataFactory( data, txtr );
        this.mc1= new egret.MovieClip( mcFactory.generateMovieClipData( "stay" ) );
        this.initBg();//初始化背景
        this.initStart();//初始化开始场景

    }
    private SW:number;//舞台宽
    private SH:number;//舞台高
    pw:number;//点宽
    ph:number;//点高
    px:number;//点x坐标
    py:number;//点y坐标
    private bg:egret.Bitmap;
    private initBg():void{
        this.SW = this.stage.stageWidth;
        this.SH = this.stage.stageHeight;
        this.pw =this.stage.stageWidth;
        this.ph = this.stage.stageHeight;
        this.stage.addChild(this.bg);
    }
    private btn_start:egret.Bitmap;
    private initStart():void{
        this.SW = this.stage.stageWidth;
        this.SH = this.stage.stageHeight;
        
        this.btn_start.x=(this.SW-this.btn_start.width)/2;
        this.btn_start.y=(this.SH-this.btn_start.height)/2;
        
        this.btn_start.touchEnabled = true;
        this.btn_start.addEventListener(egret.TouchEvent.TOUCH_TAP,this.gamestart,this);
        this.stage.addChild(this.btn_start);
    }
    private initGreypot():void{
        for(var i=0;i<9;i++){
            for(var j=0;j<9;j++){
                this.createGreypot(i*9+j);
                this.SW+=this.pw;
                id[i*9+j]=i*9+j;
                posx[i*9+j]=this.px;
                posy[i*9+j]=this.py;
                red[i+j]=false;                            
            }
            if(i%2==1)
                this.SW = this.stage.stageWidth;
            else
                this.SW = this.stage.stageWidth+this.pw/2;
            this.SH = this.stage.stageHeight+this.ph*(i+1);
        }
        tempcatx=posx[40];
        tempcaty=posy[40];
    }
    private initRedpot():void{
        var rednum:number=Math.floor(Math.random()*10)+10;
        var redid:number[]=[];
        for(var i=0;i<rednum;i++){
            redid[i]=Math.floor(Math.random()*81);
        }
        for(var i=0;i<rednum;i++){
            if(redid[i]==40){
                continue;
            }
            this.createRedpot(posx[redid[i]],posy[redid[i]]);
            red[redid[i]]=true;
        }
    }
    private removeCat():void{
        this.stage.removeChild(this.mc1);
        this.moveCat();
        count++;
        
    }
    private createGreypot(id:number):void{
        
        var pot1=this.createBitmapByName("pot1_png");
        this.pw=pot1.width+5;
        this.ph=pot1.height;
        pot1.x=this.SW-620+this.pw;
        this.px=pot1.x;
        pot1.y=this.SH-568+this.ph;
        this.py=pot1.y;
        this.stage.addChild(pot1);
    }
    private createRedpot(x:number,y:number):void{
        var pot2=this.createBitmapByName("pot2_png");
        pot2.x=x;
        pot2.y=y;
        this.stage.addChild(pot2);
    }
    private SW2:number;
    private SH2:number;

    private touch():void{
        this.bg.touchEnabled=true;
        this.bg.addEventListener(egret.TouchEvent.TOUCH_TAP,this.toRed,this);
        this.bg.addEventListener(egret.TouchEvent.TOUCH_TAP,this.removeCat,this);
        
        
    }
    private toRed(click:egret.TouchEvent):void{
        
        var x=click.localX;
        var y=click.localY;
        this.SH2=this.stage.stageHeight-568+this.ph;
        var i=Math.floor((y-this.SH2)/this.ph);
        var j=0;
        if(i%2==0){
            this.SW2=this.stage.stageWidth-620+this.pw;
            j=Math.floor((x-this.SW2)/this.pw);
        }
        else{
            this.SW2=this.stage.stageWidth-620+this.pw*1.5;
            j=Math.floor((x-this.SW2)/this.pw);
        }
        temppotid=i*9+j;
        this.createRedpot(posx[temppotid],posy[temppotid]);
        red[temppotid]=true;
    }
    private mc1:egret.MovieClip;
    private moveCat():void{
        
        this.mc1.x=tempcatx;
        this.mc1.y=tempcaty;
        this.stage.addChild(this.mc1);
        
        this.mc1.gotoAndPlay(0,-1);
        var catid=tempcatid;
        enum surround0{left=39,right=41,leftup=31,rightup=32,leftdown=49,rightdown=50};
        while(catid>8){
            catid-=9;
        }
        if(catid%2==0){
            enum surround{left=tempcatid-1,right=tempcatid+1,leftup=tempcatid-9,rightup=tempcatid-9,leftdown=tempcatid+9,rightdown=tempcatid+9};
            if(!red[surround.leftup]){
                if(id[surround.leftup]>=0&&id[surround.leftup]<=8||id[surround.leftup]>=72&&id[surround.leftup]<=80||id[surround.leftup]%9==0||id[surround.leftup]%9==8){
                    this.lose();
                   
                }
                this.mc1.x=posx[surround.leftup];
                this.mc1.y=posy[surround.leftup];
                tempcatid=surround.leftup;
            }
            else if(!red[surround.left]){
                if(id[surround.left]>=0&&id[surround.left]<=8||id[surround.left]>=72&&id[surround.left]<=80||id[surround.left]%9==0||id[surround.left]%9==8){
                    this.lose();
                   
                }
                this.mc1.x=posx[surround.left];
                this.mc1.y=posy[surround.left];
                tempcatid=surround.left;
            }
            
            else if(!red[surround.right]){
                if(id[surround.right]>=0&&id[surround.right]<=8||id[surround.right]>=72&&id[surround.right]<=80||id[surround.right]%9==0||id[surround.right]%9==8){
                    this.lose();
                    
                }
                this.mc1.x=posx[surround.right];
                this.mc1.y=posy[surround.right];
                tempcatid=surround.right;
            }
            else if(!red[surround.rightup]){
                if(id[surround.rightup]>=0&&id[surround.rightup]<=8||id[surround.rightup]>=72&&id[surround.rightup]<=80||id[surround.rightup]%9==0||id[surround.rightup]%9==8){
                    this.lose();
                    
                }
                this.mc1.x=posx[surround.rightup];
                this.mc1.y=posy[surround.rightup];
                tempcatid=surround.rightup;
            }
            else if(!red[surround.rightdown]){
                if(id[surround.rightdown]>=0&&id[surround.rightdown]<=8||id[surround.rightdown]>=72&&id[surround.rightdown]<=80||id[surround.rightdown]%9==0||id[surround.rightdown]%9==8){
                    this.lose();
                   
                }
                this.mc1.x=posx[surround.rightdown];
                this.mc1.y=posy[surround.rightdown];
                tempcatid=surround.rightdown;
            }
            else if(!red[surround.leftdown]){
                if(id[surround.leftdown]>=0&&id[surround.leftdown]<=8||id[surround.leftdown]>=72&&id[surround.leftdown]<=80||id[surround.leftdown]%9==0||id[surround.leftdown]%9==8){
                    this.lose();
                    
                }
                this.mc1.x=posx[surround.leftdown];
                this.mc1.y=posy[surround.leftdown];
                tempcatid=surround.leftdown;
            }
            else this.win();
            this.stage.addChild(this.mc1);
            
        }
        else{
            enum surround{left=tempcatid-1,right=tempcatid+1,leftup=tempcatid-9,rightup=tempcatid-9,leftdown=tempcatid+9,rightdown=tempcatid+9};
            if(!red[surround.leftup]){
                if(id[surround.leftup]>=0&&id[surround.leftup]<=8||id[surround.leftup]>=72&&id[surround.leftup]<=80||id[surround.leftup]%9==0||id[surround.leftup]%9==8){
                    this.lose();
                    
                }
                this.mc1.x=posx[surround.leftup];
                this.mc1.y=posy[surround.leftup];
                tempcatid=surround.leftup;
            }
            else if(!red[surround.left]){
                if(id[surround.left]>=0&&id[surround.left]<=8||id[surround.left]>=72&&id[surround.left]<=80||id[surround.left]%9==0||id[surround.left]%9==8){
                    this.lose();

                }
                this.mc1.x=posx[surround.left];
                this.mc1.y=posy[surround.left];
                tempcatid=surround.left;
            }
            
            else if(!red[surround.right]){
                if(id[surround.right]>=0&&id[surround.right]<=8||id[surround.right]>=72&&id[surround.right]<=80||id[surround.right]%9==0||id[surround.right]%9==8){
                    this.lose();
                    
                }
                this.mc1.x=posx[surround.right];
                this.mc1.y=posy[surround.right];
                tempcatid=surround.right;
            }
            else if(!red[surround.rightup]){
                if(id[surround.rightup]>=0&&id[surround.rightup]<=8||id[surround.rightup]>=72&&id[surround.rightup]<=80||id[surround.rightup]%9==0||id[surround.rightup]%9==8){
                    this.lose();
                    
                }
                this.mc1.x=posx[surround.rightup];
                this.mc1.y=posy[surround.rightup];
                tempcatid=surround.rightup;
            }
            else if(!red[surround.rightdown]){
                if(id[surround.rightdown]>=0&&id[surround.rightdown]<=8||id[surround.rightdown]>=72&&id[surround.rightdown]<=80||id[surround.rightdown]%9==0||id[surround.rightdown]%9==8){
                    this.lose();
                    
                }
                this.mc1.x=posx[surround.rightdown];
                this.mc1.y=posy[surround.rightdown];
                tempcatid=surround.rightdown;
            }
            else if(!red[surround.leftdown]){
                if(id[surround.leftdown]>=0&&id[surround.leftdown]<=8||id[surround.leftdown]>=72&&id[surround.leftdown]<=80||id[surround.leftdown]%9==0||id[surround.leftdown]%9==8){
                    this.lose();
                    
                }
                this.mc1.x=posx[surround.leftdown];
                this.mc1.y=posy[surround.leftdown];
                tempcatid=surround.leftdown;
            }
            else this.win();
            this.stage.addChild(this.mc1);
        }
        
        
    }
    private victory:egret.Bitmap;
    private  wintxt:egret.TextField;
    
    private win():void{
        this.victory.x=(this.stage.width-this.victory.width)/2;
        this.victory.y=((this.stage.height-this.victory.height))/2;
        this.stage.addChild(this.victory);
        this.wintxt=new egret.TextField();
        this.wintxt.size=20;
        this.wintxt.width=300;
        this.wintxt.height=100;
        this.wintxt.textColor = 0x00ff00; 
        this.wintxt.x=(this.stage.width-this.wintxt.width)/2;
        this.wintxt.y=(this.stage.height-this.wintxt.height)/2+100;
        this.wintxt.text="围住神经猫！！！\n你这么吊家里人知道吗？";
        this.stage.addChild(this.wintxt);
        count=0;
        flag=true;;
        this.replay();
    }
    private defeat:egret.Bitmap;
    private  defeattxt:egret.TextField;
    private lose():void{
        this.defeat.x=(this.stage.width-this.defeat.width)/2;
        this.defeat.y=((this.stage.height-this.defeat.height))/2;
        this.stage.addChild(this.defeat);
        this.defeattxt=new egret.TextField();
        this.defeattxt.size=20;
        this.defeattxt.width=300;
        this.defeattxt.height=100;
        this.defeattxt.textColor = 0x00ff00; 
        this.defeattxt.x=(this.stage.width-this.defeattxt.width)/2;
        this.defeattxt.y=(this.stage.height-this.defeattxt.height)/2+100;
        this.defeattxt.text="神经猫跑了！！！\n精神病人从来都说自己没病2333";
        this.stage.addChild(this.defeattxt);
        count=0;
        flag=false;
        this.replay();
        
    }
    private again:egret.Bitmap;
    private replay():void{
        this.again.x=(this.stage.width-this.again.width)/2;
        this.again.y=this.stage.height*0.8;
        this.stage.addChild(this.again);
        this.again.$touchEnabled=true;
        this.again.addEventListener(egret.TouchEvent.TOUCH_TAP,this.createGameScene2,this);
    }
    private createGameScene2():void{
        tempcatid=40;
        for(var i=0;i<81;i++){
            red[i]=false;
        }
        this.bg = this.createBitmapByName("bg_jpg");
        this.btn_start=this.createBitmapByName("btn_start_png");
        this.victory=this.createBitmapByName("victory_png");
        this.defeat=this.createBitmapByName("failed_png");
        this.again=this.createBitmapByName("replay_png");
        var data = RES.getRes("stay_json");
        var txtr = RES.getRes("stay_png");
        var mcFactory:egret.MovieClipDataFactory = new egret.MovieClipDataFactory( data, txtr );
        this.mc1= new egret.MovieClip( mcFactory.generateMovieClipData( "stay" ) );
        this.initBg();
        this.initStart();

    }
    private gamestart():void{
        this.stage.removeChild(this.btn_start);//移除开始界面
        
        this.initGreypot();//初始化灰点
        this.mc1.x=posx[40];
        this.mc1.y=posy[40];
        this.stage.addChild(this.mc1);
        this.initRedpot();//初始化红点
        this.touch();
    }
    
    /**
     * 根据name关键字创建一个Bitmap对象。name属性请参考resources/resource.json配置文件的内容。
     * Create a Bitmap object according to name keyword.As for the property of name please refer to the configuration file of resources/resource.json.
     */
    createBitmapByName(name: string) {
        let result = new egret.Bitmap();
        let texture: egret.Texture = RES.getRes(name);
        result.texture = texture;
        return result;
    }

    /**
     * 描述文件加载成功，开始播放动画
     * Description file loading is successful, start to play the animation
     */
    private startAnimation(result: string[]) {
        let parser = new egret.HtmlTextParser();

        let textflowArr = result.map(text => parser.parse(text));
        let textfield = this.textfield;
        let count = -1;
        let change = () => {
            count++;
            if (count >= textflowArr.length) {
                count = 0;
            }
            let textFlow = textflowArr[count];

            // 切换描述内容
            // Switch to described content
            textfield.textFlow = textFlow;
            let tw = egret.Tween.get(textfield);
            tw.to({ "alpha": 1 }, 200);
            tw.wait(2000);
            tw.to({ "alpha": 0 }, 200);
            tw.call(change, this);
        };

        change();
    }
}


