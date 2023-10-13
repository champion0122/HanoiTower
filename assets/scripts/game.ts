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

    start() {
        // add this to window as game property
       (window as any).game = this; 

        this.initBlock(6);
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
            const blockHeight = blockNode.getComponent(UITransform).contentSize.height;
            this.blockLayerNode.addChild(blockNode);
            const newPos = {...this._basePosArr[0],y: this._lowestBaseY + blockHeight * (blockNum - i) } as Vec3;
            // 设置位置
            blockNode.setPosition(newPos);
            // 初始化
            blockNode.getComponent(block).init(i);
        }
        
    }

    checkWhichBase(pos: Vec3): number {
        const {x, y} = pos;
        for (let i = 0; i < this._basePosArr.length; i++) {
            const basePos = this._basePosArr[i];
            if (x >= basePos.x - this._baseSize.width / 2 && x <= basePos.x + this._baseSize.width / 2 && y >= basePos.y - this._baseSize.height / 2 && y <= basePos.y + this._baseSize.height / 2) {
                return i;
            }
        }
        return -1;
    }
  
}


