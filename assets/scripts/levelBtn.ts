import { _decorator, Button, Component, Label, Node } from 'cc';
const { ccclass, property } = _decorator;

declare var game;

@ccclass('levelBtn')
export class levelBtn extends Component {
    _level: number;
    start() {

    }

    update(deltaTime: number) {
        
    }

    init(level: number) {
        this.getComponentInChildren(Label).string = `${level}`;
        this._level = level;
        if(game._level === this._level){
            this.node.getComponent(Button).interactable = false;
        }
    }

     // 按钮点击事件
    levelClick(event: Event) {
        game._level = this._level;
        game.reset();
        game.closeChooseBtn();
    }
}


