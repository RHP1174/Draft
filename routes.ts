import { Request, Response } from "express";

/**
 * Represents a draft, containing the drafters,
 * different options, the number of rounds, and the
 * list of options picked corresponding with the drafter.
 */
export type Draft = {
  drafters: string[];
  options: string[];
  rounds: number;
  draftState: DraftState[];
};

/**
 * Represents the picks so far 
 * corresponding with the drafter.
 */
export type DraftState = {
  pick: string;
  drafter: string;
}

/**
 * Represents the drafts with the keys being the unique
 * identification number corresponding to each draft.
 */
export let drafts: Map<number, Draft> = new Map();

// This method creates the draft.
export function createDraft(req: Request, res: Response): void {
  const rounds = first(req.body.rounds);
  
  if (rounds === undefined || typeof rounds !== 'string') {
    res.status(400).send('Missing the "rounds" parameter!');
    return;
  }
  
  if (rounds.trim() === '') {
    res.json(JSON.stringify(`Error: The number of rounds is empty!`));
    return;
  }
  

  const options = first(req.body.options);
  if (options === undefined || typeof options !== 'string') {
    res.status(400).send('Missing the "options" parameter');
    return;
  }

  if (options.trim() === '') {
    res.json(JSON.stringify(`Error: There's no options to choose from!`));
    return;
  }

  const drafters = first(req.body.drafters);
  if (drafters === undefined || typeof drafters !== 'string') {
    res.status(400).send('Missing the "drafters" parameter!');
    return;
  }

  if (drafters.trim() === '') {
    res.json(JSON.stringify(`Error: There's no drafters!`));
    return;
  }

  const drafter = first(req.body.drafter);
  if (drafter === undefined || typeof drafter !== 'string') {
    res.status(400).send('Missing the "drafter" parameter!');
    return;
  }

  if (drafter.trim() === '') {
    res.json(JSON.stringify(`Error: Enter valid Drafter name!`));
    return;
  }

  const splitDrafters = drafters.split("\n");
  const splitOptions = options.split("\n");

  if (splitDrafters.length > splitOptions.length) {
    res.json(JSON.stringify(`Error: There's too many drafters than options!`));
    return;
  }

  drafts.set(drafts.size + 1, 
                            {drafters: splitDrafters, 
                             options: splitOptions, 
                             rounds: Number(rounds) * splitDrafters.length, 
                             draftState: []});
  res.json(JSON.stringify({id: drafts.size, drafter: drafter}));
}

// This method drafts the pick chosen by the drafter and 
// updates the number of rounds left and list of options.
export function draftPlayer(req: Request, res: Response): void {
  const pick = first(req.body.pick);

  if (pick === undefined || typeof pick !== 'string') {
    res.status(400).send('Missing the "data" parameter!');
    return;
  }

  const drafter = first(req.body.drafter);
  if (drafter === undefined || typeof drafter !== 'string') {
    res.status(400).send('Missing the "data" parameter!');
    return;
  }

  const id = first(req.body.id);
  if (id === undefined || typeof id !== 'string') {
    res.status(400).send('Missing the "id" parameter!');
    return
  }

  const currDraft = drafts.get(Number(id));
  if (currDraft === undefined) {
    res.status(400).send(`id number ${id} does not exist!`);
    return;
  }

  currDraft.draftState.push({pick: pick, drafter: drafter});

  currDraft.rounds -= 1;
  if (currDraft.rounds === 0) {
    currDraft.options = [];
  }

  const removeFirst = currDraft.drafters.shift();
  if (removeFirst !== undefined) {
    currDraft.drafters.push(removeFirst);
  }

  currDraft.options.splice(currDraft.options.indexOf(pick), 1);  

  res.json(JSON.stringify({drafter: currDraft.drafters[0], 
                           drafters: currDraft.drafters, 
                           options: currDraft.options.filter(str => str !== ""), 
                           draftState: currDraft.draftState}));
}

// This method gets the draft requesting an
// indentification number to access it.
export function getDraft(req: Request, res: Response): void {
  const id = first(req.query.id);
 
  if (id === undefined || typeof id !== 'string') {
    res.status(400).send('missing "id" parameter');
    return
  }

  const currDraft = drafts.get(Number(id));
  if (currDraft === undefined) {
    res.status(400).send(`ID number ${id} does not exist`);
    return;
  }

  res.json(JSON.stringify(currDraft));
}

// This method is used to join a draft.
export function joinDraft(req: Request, res: Response): void {
  const id = first(req.query.id);

  if (id === undefined || typeof id !== 'string') {
    res.status(400).send('Missing the "id" parameter!');
    return
  }

  const currDraft = drafts.get(Number(id));
  if (currDraft === undefined) {
    res.json(JSON.stringify(`Error: No draft with ID:${id}`));
    return;
  }

  res.json(JSON.stringify(currDraft));
}

// Method to clear the map with the drafts.
// Used only for testing.
export function clearDraftsT(): void {
  drafts.clear()
}

// Used to get a draft given an identification number.
// Used only for testing.
export function getDraftT(id: number): Draft {
  const draft = drafts.get(id);
  if (draft === undefined) {
    return {drafters: [], options: [], rounds: 0, draftState: []}; // This was arbitrary
  } else {
    return draft;
  }
  
}

// Helper to return the (first) value of the parameter if any was given.
// (This is mildly annoying because the client can also give mutiple values,
// in which case, express puts them into an array.)
function first(param: any): string|undefined {
  if (Array.isArray(param)) {
    return first(param[0]);
  } else if (typeof param === 'string') {
    return param;
  } else {
    return undefined;
  }
}
