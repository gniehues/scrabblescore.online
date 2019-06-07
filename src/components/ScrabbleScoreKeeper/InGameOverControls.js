import React from 'react';
import CurrentScore from './CurrentScore';
import { scrabbleScore } from '../../logic/util';
import ScrabbleInputBox from '../ScrabbleInputBox/ScrabbleInputBox';

const emptyWord = { value: '', modifiers: [], score: 0 };

class InGameOverControls extends React.Component {
  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
    this.handleUndo = this.handleUndo.bind(this);
    this.handleLeftOvers = this.handleLeftOvers.bind(this);
    this.input = React.createRef();
    this.state = {
      currentWord: emptyWord,
    };
  }

  componentDidMount() {
    this.input.current.focus();
  }

  resetCurrentWord() {
    this.setState({ currentWord: emptyWord });
  }

  handleUndo() {
    const { onUndo } = this.props;
    onUndo();
    this.resetCurrentWord();
  }

  handleChange(word) {
    const { language } = this.props;
    const currentWord = { ...word, score: -scrabbleScore(word.value, word.modifiers, language) };
    this.setState({ currentWord });
  }

  handleLeftOvers(e) {
    const { currentWord } = this.state;
    let { game, onSetGame } = this.props;
    e.preventDefault(); /* prevent form submission */
    game = currentWord.value.length !== 0
      ? game.addWord(currentWord) : game;
    game = game.endTurn();
    game = game.currentPlayerIndex === game.players.length - 1
      ? game.distributeLeftOversToReapers(game.getReapers(), game.getSumOfLeftovers())
      : game;
    onSetGame(game);
    this.resetCurrentWord();
  }

  render() {
    const { currentWord } = this.state;
    const { game, language, undoDisabled } = this.props;
    const submitButtonText = currentWord.value.length > 0 ? 'SUBMIT LEFTOVERS' : 'SUBMIT NO LEFTOVERS';
    return (
      <div>
        {!game.areLeftOversSubmitted()
          ? (
            <form autoComplete="off">
              <ScrabbleInputBox
                ref={this.input}
                onChange={this.handleChange}
                word={currentWord}
                language={language}
              />
              <CurrentScore score={currentWord.score} />
              <button onClick={this.handleUndo} type="button" className="btn btn-info word-submit-button" disabled={undoDisabled}>UNDO</button>
              <button onClick={this.handleLeftOvers} type="submit" className="btn btn-danger end-game">{submitButtonText}</button>
            </form>
          )
          : (
            <div>
              <button onClick={this.handleUndo} type="button" className="btn btn-info word-submit-button" disabled={undoDisabled}>UNDO</button>
            </div>
          )
        }
      </div>
    );
  }
}

export default InGameOverControls;