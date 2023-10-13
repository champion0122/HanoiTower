import { _decorator, Component, instantiate, Node, Prefab, Size, UITransform, Vec3 } from 'cc';
import { block } from './block';
const { ccclass, property } = _decorator;

@ccclass('game')
export class game extends Component {
    @property(Node) baseLayerNode: Node;
    @property(Node) blockLayerNode: Node;
    @property(Prefab) block: Prefab;

    _lowestBaseY = -166;
    _basePosArr: Vec3[];
    _baseSize: Size;
    _blockHeight: number;
    _blockSortedArr: [Node[],Node[],Node[]];

    start() {
        // add this to window as game property
       (window as any).game = this; 

        this.initBlock(6);
        this.getBlock();
    }

    update(deltaTime: number) {
        
    }
 
    initBlock(blockNum: number) {
        const baseArr = this.baseLayerNode.children;
        this._basePosArr = baseArr.map(n => {
            return n.position;
        })
        this._baseSize = baseArr[0].getComponent(UITransform).contentSize;
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

    getBlock() {
        this._blockSortedArr = [[],[],[]];
        this.blockLayerNode.children.forEach((n: any) => {
            this._basePosArr.forEach((element,index) => {
                if(n.position.x === element.x){
                    this._blockSortedArr[index].push(n);
                }
            });
        })
        console.log(this._blockSortedArr)
    }
  

    // 获取指定base的已有y高度
    getBaseY(baseIndex: number): number {
        return this._lowestBaseY + this._blockSortedArr[baseIndex].length * this._blockHeight;
    }
}


