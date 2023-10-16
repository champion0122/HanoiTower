import { _decorator, Component, director, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('firstScene')
export class firstScene extends Component {
    start() {

    }

    update(deltaTime: number) {
        
    }

    startGame() {
        director.loadScene('game');
    }
}


