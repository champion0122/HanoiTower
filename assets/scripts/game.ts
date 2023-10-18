import { _decorator, Component, director, Event, instantiate, Label, Layout, Node, Prefab, Size, UITransform, Vec3 } from 'cc';
import { block } from './block';
import { levelBtn } from './levelBtn';
const { ccclass, property } = _decorator;

@ccclass('game')
export class game extends Component {
    @property(Node) baseLayerNode: Node;
    @property(Node) blockLayerNode: Node;
    @property(Prefab) block: Prefab;
    @property(Prefab) levelBtn: Prefab;
    @property(Label) stepLabel: Label;    
    @property(Label) levelLabel: Label;    
    @property(Node) friendRank: Node | null = null;
    @property(Node) closeBtn: Node;
    @property(Node) successMask: Node;
    @property(Node) nextLevelMask: Node;
    @property(Node) chooseLevelLayerNode: Node;
    
    _level = 1;
    _basePosArr: Vec3[];
    _baseSize: Size;
    _lowestBaseY;
    _blockHeight: number;
    _blockSortedArr: [Node[],Node[],Node[]];
    _steps = 0;

    start() {
        // add this to window as game property
       (window as any).game = this; 

       this.setCurLevel();
       this.initBlock(this._level + 2);
       this.sortBlock();
    }

    update(deltaTime: number) {
        if(this._blockSortedArr[2].length === this._level + 2) {
            if(this._level === 4){
                this.storageScore();
                this.successMask.active = true;
            }
            else {
                this.nextLevelMask.active = true;
            }
        }
        this.stepLabel.string = `已用步数:${this._steps}`;
    }
 
    restart() {
        this._level = 1;
        this.reset();
        this.successMask.active = false;
    }

    initBlock(blockNum: number) {
        const baseArr = this.baseLayerNode.children;
        this._basePosArr = baseArr.map(n => {
            return n.position;
        })
        this._baseSize = baseArr[0].getComponent(UITransform).contentSize;
        this._lowestBaseY =  0 - this._baseSize.y / 2;
        
        for (let i = 0; i < blockNum; i++) {
            const blockNode = instantiate(this.block);
            this._blockHeight = blockNode.getComponent(UITransform).contentSize.height;
            this.blockLayerNode.addChild(blockNode);
            const newPos = {...this._basePosArr[0],y: this._lowestBaseY + this._blockHeight * (blockNum - i) } as Vec3;
            // 设置位置
            blockNode.setPosition(newPos);
            // 初始化
            blockNode.getComponent(block).init(i);
        }
        
    }

    checkWhichBase(pos: Vec3, block: Node): number {
        const {x, y} = pos;
        for (let i = 0; i < this._basePosArr.length; i++) {
            const basePos = this._basePosArr[i];
            if (x >= basePos.x - this._baseSize.width / 2 && x <= basePos.x + this._baseSize.width / 2 
            && y >= basePos.y - this._baseSize.height / 2 && y <= basePos.y + this._baseSize.height / 2) {
                if(this.checkCanPutBlock(block, i))
                    return i;
                else 
                    return -1;
            }
        }
        return -1;
    }

    // 判断block是否可以放置
    checkCanPutBlock(block: Node, baseIndex: number): boolean {
        if(this._blockSortedArr[baseIndex].length === 0)
            return true;

        // is _blockSortedArr[i][0]'s width >= block's width
        const lastBlock = this._blockSortedArr[baseIndex][0];
        const lastBlockWidth = lastBlock.getComponent(UITransform).contentSize.width;
        const blockWidth = block.getComponent(UITransform).contentSize.width;
        return lastBlockWidth > blockWidth;
    }

    sortBlock() {
        this._blockSortedArr = [[],[],[]];
        this.blockLayerNode.children.forEach((n: any) => {
            this._basePosArr.forEach((element,index) => {
                if(n.position.x === element.x){
                    this._blockSortedArr[index].push(n);
                }
            });
        })
        // console.log(this._blockSortedArr)
    }
  

    // 获取指定base的已有y高度
    getBaseY(baseIndex: number): number {
        return this._lowestBaseY + this._blockSortedArr[baseIndex].length * this._blockHeight;
    }

    reset(){
        this._blockSortedArr = [[],[],[]];
        this._steps = 0;
        this.blockLayerNode.children.forEach((n) => {
            // destroy(n);
            n.destroy();
        })

        // 下一帧回调
        this.scheduleOnce(() => {
            this.start();
        })
    }

    onClickFriendRank() {
        this.closeView();
        this.closeBtn.active = true;
        this.friendRank.active = true;
        window["wx"].postMessage({ command: "render" });
    }

    closeView() {
        this.closeBtn.active = false;
        this.friendRank.active = false;
        // 发消息给子域
        window["wx"].postMessage({ command: "close" });
    }

    setCurLevel(){
        this.levelLabel.string = `当前关卡:${this._level}`;
        // 发消息给子域
        if(window["wx"])
            window["wx"].postMessage({ command: "setCurLevel", level: this._level });
    }

    // wx 存储
    storageScore(){
        const that = this;
        const key = `wxScore-${this._level}`;
        window["wx"].setUserCloudStorage({
            KVDataList: [
                {
                    key: `wxScore-${this._level}`,
                    value: JSON.stringify({
                        level: this._level,
                        steps: this._steps,
                        updateTime: Date.now(),
                    }),
                },
            ]
        });
        // window["wx"].getUserInfo({
        //     openIdList: ['selfOpenId'],
        //     success(res) {
        //         const myself = res.data[0];
        //         console.log('myself',myself);
        //         // window["wx"].getFriendCloudStorage({
        //         //     keyList: [key],
        //         //     success(result) {
        //         //         console.log('result',result)
        //         //         if(result.data.length !== 0){
        //         //             const myPreData = result.data.find((user) => user.openid === myself.openid).KVDataList[0];
        //         //             // KVDataList为空，直接走存储流程
        //         //             if(!myPreData){
        //         //                 wxSetCloudStorage();
        //         //             }
        //         //             const {steps} = JSON.parse(myPreData.value);
        //         //             if(steps <= that._steps){
        //         //                 // 存储新数据
        //         //                 wxSetCloudStorage();
        //         //             }
        //         //         } else {
        //         //             // 没有好友数据
        //         //             wxSetCloudStorage();
        //         //         }
        //         //     }
        //         // });
        //     },
        //     fail(err) {
        //         console.log('fail',JSON.stringify(err));
        //     }
        // });
    }

    // next level
    nextLevelClick () {
        this.storageScore();
        this._level++;
        this.reset();
        this.nextLevelMask.active = false;
    }

    // choose level btn
    clickChooseBtn() {
        this.chooseLevelLayerNode.active = true;
        for(let i = 1; i <= 4; i++){
            const levelBtnNode = instantiate(this.levelBtn);
            levelBtnNode.getComponent(levelBtn).init(i);
            this.chooseLevelLayerNode.getChildByName('btnContainer').addChild(levelBtnNode);
        }
    }

    closeChooseBtn(){
        this.chooseLevelLayerNode.active = false;
        this.scheduleOnce(() => {
            this.chooseLevelLayerNode.getChildByName('btnContainer').destroyAllChildren();
        })
    }
}


