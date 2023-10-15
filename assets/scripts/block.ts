import { _decorator, Component, Input, Node, Sprite, SpriteAtlas, UITransform, Vec3, view } from 'cc';

const { ccclass, property } = _decorator;

declare var game: any;

@ccclass('block')
export class block extends Component {
    @property(SpriteAtlas)  colorAtlas: SpriteAtlas;

    _delta: Vec3;
    _prePos: Vec3;

    // private _isFirst: boolean;
    _isFirst: boolean;
    
    start() {
        this.node.on(Input.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.on(Input.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.node.on(Input.EventType.TOUCH_END, this.onTouchEnd, this);
    }

    update(deltaTime: number) {
       if(game._blockSortedArr.findIndex(n => n[0] === this.node) !== -1) {
           this._isFirst = true;
       } else {
           this._isFirst = false;
       }

    }

    // destroy(): boolean {
    //     this.node.off(Input.EventType.TOUCH_START, this.onTouchStart, this);
    //     this.node.off(Input.EventType.TOUCH_MOVE, this.onTouchMove, this);
    //     return super.destroy();
    // }

    init(blockIndex: number) {
        // set different color
        this.node.getComponent(Sprite).spriteFrame = this.colorAtlas.getSpriteFrame(`${blockIndex}`);

        // set width
        const formerSize = this.node.getComponent(UITransform).contentSize;
        this.node.getComponent(UITransform).setContentSize({
           ...formerSize,
           width: formerSize.width * (blockIndex + 1) * 2 / 3 
        });
    }

    onTouchStart() {
        this._prePos = this.node.getPosition(); 
    }

    onTouchMove(e) {
        if(!this._isFirst) return;

        let pos = e.getUILocation();
        this.node.setWorldPosition(pos.x, pos.y, 0);

    }

    onTouchEnd() {
        const curPosition = this.node.getPosition();
        const whichBase = game.checkWhichBase(curPosition, this);
        if (whichBase !== -1) {
            // set block postion to base position
            this.node.setPosition({...curPosition, x: game._basePosArr[whichBase].x, y: game.getBaseY(whichBase) + game._blockHeight} as Vec3);
            game._steps++;
        } else {
            // set node postion to pre position
            this.node.setPosition(this._prePos);
        }

        game.sortBlock();
    }
}
