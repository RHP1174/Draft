import React, { ChangeEvent, Component } from "react";

type DraftState = {
  pick: string;
  drafter: string;
}

interface PickProps {
  id: undefined | number;
  currDrafter: string;
  back: () => void;
}

interface PickState {
  drafters: string[];
  options: string[];
  rounds: number;
  drafterState: string;
  draftState: DraftState[];
  pick: string;
}

export class DraftPick extends Component<PickProps, PickState> {

  constructor(props: any) {
    super(props);

    this.state = {
      drafters: [],
      options: [],
      rounds: 0,
      drafterState: "",
      draftState: [],
      pick: ""
    };

    this.handleGetDraft();
  }

  render = (): JSX.Element => {
    let options: JSX.Element[] = [];
    for (let i = 0; i < this.state.options.length; i++) {
      options.push(
        <option key={this.state.options[i]} value={this.state.options[i]}>{this.state.options[i]}</option>
      );
    }

    let picks: JSX.Element[] = [];
    for (let i = 0; i < this.state.draftState.length; i++) {
      picks.push(
        <tr key={i}>
          <td>{i + 1}</td>
          <td>{this.state.draftState[i].pick}</td>
          <td>{this.state.draftState[i].drafter}</td>
        </tr>
      );
    }

    let table: JSX.Element;
    if (this.state.draftState.length === 0) {
      table = (
        <p>No picks made yet.</p>
      );
    } else {
      table = (
        <table className="table">
          <tbody>
            <tr>
              <td><strong>Num</strong></td>
              <td><strong>Pick</strong></td>
              <td><strong>Drafter</strong></td>
            </tr>
            {picks}
          </tbody>
        </table>
      );
    }

    if (this.state.options.length === 0) {
      return (
        <div>
          <h2>Status of Draft "{this.props.id}"</h2>
          <div>
            <div>
              {table}
            </div>
            <div>
              <p>Draft is complete.</p>
              <button onClick={() => this.props.back()}>Back</button>
            </div>
          </div>
        </div>
      );
    } else if (this.state.drafterState === this.props.currDrafter) {
      return (
        <div>
          <h2>Status of Draft "{this.props.id}"</h2>
          <div>
            <div>
              {table}
              <p>It's your pick!</p>
              <div>
                <select onChange={this.opSelChange}>
                  <option>Pick Your Item</option>
                  {options}
                </select>
                <button className="pickButton" onClick={this.handleDraftPlayer}>Draft</button>
                <button className="pickButton" onClick={() => this.props.back()}>Back</button>
              </div>
            </div>
          </div>
        </div>
      );
    } else {
      return (
        <div>
          <h2>Status of Draft "{this.props.id}"</h2>
          <div>
            <div>
              <table className="table">
                <tbody>
                  <tr>
                    <td><strong>Num</strong></td>
                    <td><strong>Pick</strong></td>
                    <td><strong>Drafter</strong></td>
                  </tr>
                  {picks}
                </tbody>
              </table>
              <div>
                <p>Waiting for {this.state.drafterState} to pick.</p>
              </div>
              <div>
                <button onClick={this.handleGetDraft}>Refresh</button>
                <button className="pickButton" onClick={() => this.props.back()}>Back</button>
              </div>
            </div>
          </div>
        </div>
      );
    }
  };

  opSelChange = (evt: ChangeEvent<HTMLSelectElement>) => {
    this.setState({pick: evt.target.value});
  }

  handleDraftPlayer = () => {
    fetch("/api/draftPlayer", {
      method: "POST",
      body: JSON.stringify({"pick": this.state.pick, "drafter": this.state.drafterState, "id": JSON.stringify(this.props.id)}),
      headers: {"Content-Type": "application/json"}})
    .then(this.handleDraftPlayerRes)
    .catch(this.handleServerError);
    this.handleGetDraft();
  }

  handleDraftPlayerRes = (res: Response) => {
    if (res.status === 200) {
      res.json().then(this.handleDraftPlayerJson).catch(this.handleServerError);
    } else {
      this.handleServerError(res);
    }
  }

  handleDraftPlayerJson = (draftState: string) => {
    this.setState({drafterState: JSON.parse(draftState).drafter, 
                   drafters: JSON.parse(draftState).drafters, 
                   options: JSON.parse(draftState).options, 
                   draftState: JSON.parse(draftState).draftState});
  }

  handleGetDraft = () => {
    fetch("/api/getDraft?id=" + this.props.id)
      .then(this.handleGetDraftRes)
      .catch(this.handleServerError);
  }

  handleGetDraftRes = (res: Response) => {
    if (res.status === 200) {
      res.json().then(this.handleGetDraftJson).catch(this.handleServerError);
    } else {
      this.handleServerError(res);
    }
  }

  handleGetDraftJson = (draft: string) => {
    this.setState({
      drafters: JSON.parse(draft).drafters, 
      options: JSON.parse(draft).options, 
      rounds: JSON.parse(draft).rounds, 
      drafterState: JSON.parse(draft).drafters[0],
      draftState: JSON.parse(draft).draftState,
      pick: JSON.parse(draft).options[0]});
  }

  handleServerError = (_: Response) => {
    console.error(`Unknown error in the server.`);
  };
}
