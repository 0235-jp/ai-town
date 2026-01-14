import Game from './components/Game.tsx';

import { ToastContainer } from 'react-toastify';
import a16zImg from '../assets/a16z.png';
import convexImg from '../assets/convex.svg';
import starImg from '../assets/star.svg';
import helpImg from '../assets/help.svg';
// import { UserButton } from '@clerk/clerk-react';
// import { Authenticated, Unauthenticated } from 'convex/react';
// import LoginButton from './components/buttons/LoginButton.tsx';
import { useState } from 'react';
import ReactModal from 'react-modal';
import MusicButton from './components/buttons/MusicButton.tsx';
import Button from './components/buttons/Button.tsx';
import InteractButton from './components/buttons/InteractButton.tsx';
import FreezeButton from './components/FreezeButton.tsx';
import { MAX_HUMAN_PLAYERS } from '../convex/constants.ts';
import PoweredByConvex from './components/PoweredByConvex.tsx';

export default function Home() {
  const [helpModalOpen, setHelpModalOpen] = useState(false);
  return (
    <main className="relative flex h-screen flex-col items-center justify-between font-body overflow-hidden">

      <ReactModal
        isOpen={helpModalOpen}
        onRequestClose={() => setHelpModalOpen(false)}
        style={modalStyles}
        contentLabel="Help modal"
        ariaHideApp={false}
      >
        <div className="font-body">
          <h1 className="text-center text-6xl font-bold font-display game-title">ヘルプ</h1>
          <p>
            AI Townへようこそ。匿名での<i>観覧</i>と、ログインしての<i>参加</i>の両方に対応しています。
          </p>
          <h2 className="text-4xl mt-4">観覧</h2>
          <p>
            クリック＆ドラッグで町を移動し、スクロールでズームできます。
            キャラクターをクリックすると、チャット履歴を見ることができます。
          </p>
          <h2 className="text-4xl mt-4">参加</h2>
          <p>
            「参加」ボタンをクリックすると、シミュレーションに参加してエージェントと直接話すことができます。
            参加後、マップ上にあなたのキャラクターが表示されます。
          </p>
          <p className="text-2xl mt-2">操作方法:</p>
          <p className="mt-4">クリックで移動します。</p>
          <p className="mt-4">
            エージェントと話すには、エージェントをクリックして「会話を始める」をクリックします。
            相手が近づいてきたら会話が始まります。会話パネルを閉じるか、離れることでいつでも退出できます。
            相手から会話を提案されることもあります。その場合はメッセージパネルに承諾ボタンが表示されます。
          </p>
          <p className="mt-4">
            AI Townは同時に{MAX_HUMAN_PLAYERS}人までの人間をサポートしています。
            5分間操作がないと、自動的にシミュレーションから退出されます。
          </p>
        </div>
      </ReactModal>
      {/*<div className="p-3 absolute top-0 right-0 z-10 text-2xl">
        <Authenticated>
          <UserButton afterSignOutUrl="/ai-town" />
        </Authenticated>

        <Unauthenticated>
          <LoginButton />
        </Unauthenticated>
      </div> */}

      <div className="w-full h-full relative isolate overflow-hidden flex flex-col">
        <Game />

        <footer className="absolute bottom-0 left-0 w-full flex items-center gap-3 p-4 flex-wrap pointer-events-none z-10">
          <div className="flex gap-4 flex-grow pointer-events-none">
            <FreezeButton />
            <MusicButton />
            <Button href="https://github.com/a16z-infra/ai-town" imgUrl={starImg}>
              GitHub
            </Button>
            <InteractButton />
            <Button imgUrl={helpImg} onClick={() => setHelpModalOpen(true)}>
              ヘルプ
            </Button>
          </div>
        </footer>
        <ToastContainer position="bottom-right" autoClose={2000} closeOnClick theme="dark" />
      </div>
    </main>
  );
}

const modalStyles = {
  overlay: {
    backgroundColor: 'rgb(0, 0, 0, 75%)',
    zIndex: 12,
  },
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
    maxWidth: '50%',

    border: '10px solid rgb(23, 20, 33)',
    borderRadius: '0',
    background: 'rgb(35, 38, 58)',
    color: 'white',
    fontFamily: '"Upheaval Pro", "sans-serif"',
  },
};
