import { _decorator, Component, Input, Node, Sprite, SpriteAtlas, UITransform, Vec3 } from 'cc';

const { ccclass, property } = _decorator;

declare var game: any;

@ccclass('block')
export class block extends Component {
    @property(SpriteAtlas)  colorAtlas: SpriteAtlas;

    _delta: Vec3;
    _prePos: Vec3;
    
    start() {
        this.node.on(Input.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.on(Input.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.node.on(Input.EventType.TOUCH_END, this.onTouchEnd, this);
    }

    update(deltaTime: number) {

       

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
        this._delta = {...e.getDelta(), z: 0};
        const prevPosition = this.node.getPosition();
        prevPosition.add(this._delta);
        this.node.setPosition(prevPosition);

    }

    onTouchEnd() {
        const curPosition = this.node.getPosition();
        const whichBase = game.checkWhichBase(curPosition);
        if (whichBase !== -1) {
            // set block postion to base position
            this.node.setPosition({...curPosition, x: game._basePosArr[whichBase].x} as Vec3);
        } else {
            // set node postion to pre position
            this.node.setPosition(this._prePos);
        }
    }
}


