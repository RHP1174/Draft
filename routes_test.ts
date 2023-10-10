import * as assert from 'assert';
import * as httpMocks from 'node-mocks-http';
import { clearDraftsT, createDraft, draftPlayer, getDraft, getDraftT, joinDraft } from './routes';

describe('routes', function() {

  it('CreateDraft', function() {

    // rounds undefined - Status 400
    const req1 = httpMocks.createRequest({method: 'POST', url: '/api/create', body: {}});
    const res1 = httpMocks.createResponse();
    createDraft(req1, res1);
    assert.deepStrictEqual(res1._getStatusCode(), 400);

    // Error: rounds defined, but is empty string
    const req2 = httpMocks.createRequest({method: 'POST', url: '/api/create', body: {rounds: ""}});
    const res2 = httpMocks.createResponse();
    createDraft(req2, res2);
    assert.deepStrictEqual(res2._getJSONData(), JSON.stringify(`Error: The number of rounds is empty!`));

    // options undefined - Status 400
    const req3 = httpMocks.createRequest({method: 'POST', url: '/api/create', body: {rounds: "3"}});
    const res3 = httpMocks.createResponse();
    createDraft(req3, res3);
    assert.deepStrictEqual(res3._getStatusCode(), 400);

    // Error: options defined, but is empty string
    const req4 = httpMocks.createRequest({method: 'POST', url: '/api/create', body: {rounds: "3", options: ""}});
    const res4 = httpMocks.createResponse();
    createDraft(req4, res4);
    assert.deepStrictEqual(res4._getJSONData(), JSON.stringify(`Error: There's no options to choose from!`));

    // drafters undefined - Status 400
    const req5 = httpMocks.createRequest({method: 'POST', url: '/api/create', body: {rounds: "3", options: "Lambo\n"}});
    const res5 = httpMocks.createResponse();
    createDraft(req5, res5);
    assert.deepStrictEqual(res5._getStatusCode(), 400);

    // Error: drafters defined, but is empty string
    const req6 = httpMocks.createRequest({method: 'POST', url: '/api/create', body: {rounds: "3", options: "Lambo\n", drafters: ""}});
    const res6 = httpMocks.createResponse();
    createDraft(req6, res6);
    assert.deepStrictEqual(res6._getJSONData(), JSON.stringify(`Error: There's no drafters!`));

    // drafter logging in is undefined - Status 400
    const req7 = httpMocks.createRequest({method: 'POST', url: '/api/create', body: {rounds: "3", options: "Lambo\n", drafters: "Team 1"}});
    const res7 = httpMocks.createResponse();
    createDraft(req7, res7);
    assert.deepStrictEqual(res7._getStatusCode(), 400);

    // Error: drafter defined, but is empty string
    const req8 = httpMocks.createRequest({method: 'POST', url: '/api/create', body: {rounds: "3", options: "Lambo\n", drafters: "Team 1", drafter: ""}});
    const res8 = httpMocks.createResponse();
    createDraft(req8, res8);
    assert.deepStrictEqual(res8._getJSONData(), JSON.stringify(`Error: Enter valid Drafter name!`));

    // All Passed Test 1: all error checks passed and draft is successfully created - Status 200
    const req9 = httpMocks.createRequest({method: 'POST', url: '/api/create', body: {rounds: "3", options: "Lambo\n", drafters: "Team 1", drafter: "Team 1"}});
    const res9 = httpMocks.createResponse();
    createDraft(req9, res9);
    assert.deepStrictEqual(res9._getStatusCode(), 200);
    assert.deepStrictEqual(res9._getJSONData(), JSON.stringify({"id": 1, "drafter": "Team 1"}));

    // All Passed Test 2: all error checks passed and draft is successfully created - Status 200
    const req10 = httpMocks.createRequest({method: 'POST', url: '/api/create', body: {rounds: "3", options: "Lambo\nBugatti\nHonda\nFiat\n", drafters: "Team Fast\nTeam Slow", drafter: "Team Fast"}});
    const res10 = httpMocks.createResponse();
    createDraft(req10, res10);
    assert.deepStrictEqual(res10._getStatusCode(), 200);
    assert.deepStrictEqual(res10._getJSONData(), JSON.stringify({"id": 2, "drafter": "Team Fast"}));
  });

  it('DraftPlayer', function() {
    // pick is undefined - Status 400
    const req1 = httpMocks.createRequest({method: 'POST', url: '/api/draftPlayer', body: {}});
    const res1 = httpMocks.createResponse();
    draftPlayer(req1, res1);
    assert.deepStrictEqual(res1._getStatusCode(), 400);

    // pick is defined, but drafter is undefined - Status 400
    const req2 = httpMocks.createRequest({method: 'POST', url: '/api/draftPlayer', body: {pick: "Lambo"}});
    const res2 = httpMocks.createResponse();
    draftPlayer(req2, res2);
    assert.deepStrictEqual(res2._getStatusCode(), 400);

    // pick and drafter defined, but identification number undefined - Status 400
    const req3 = httpMocks.createRequest({method: 'POST', url: '/api/draftPlayer', body: {pick: "Lambo", drafter: "Team Fast"}});
    const res3 = httpMocks.createResponse();
    draftPlayer(req3, res3);
    assert.deepStrictEqual(res3._getStatusCode(), 400);
    
    // All Passed Test 1: all error checks passed and successfully drafted pick with the corresponding drafter and round num - Status 200
    const req4 = httpMocks.createRequest({method: 'POST', url: '/api/draftPlayer', body: {pick: "Lambo", drafter: "Team Fast", id: "2"}});
    const res4 = httpMocks.createResponse();
    draftPlayer(req4, res4);
    assert.deepStrictEqual(res4._getStatusCode(), 200);
    assert.deepStrictEqual(res4._getJSONData(), JSON.stringify({"drafter": "Team Slow", 
                                                                "drafters": ["Team Slow", "Team Fast"], 
                                                                "options": ["Bugatti", "Honda", "Fiat"], 
                                                                "draftState": [{"pick": "Lambo", "drafter": "Team Fast"}]}));

    // All Passed Test 2: all error checks passed and successfully drafted pick with the corresponding drafter and round num - Status 200
    const req5 = httpMocks.createRequest({method: 'POST', url: '/api/draftPlayer', body: {pick: "Honda", drafter: "Team Slow", id: "2"}});
    const res5 = httpMocks.createResponse();
    draftPlayer(req5, res5);
    assert.deepStrictEqual(res5._getStatusCode(), 200);
    assert.deepStrictEqual(res5._getJSONData(), JSON.stringify({"drafter": "Team Fast", 
                                                                "drafters": ["Team Fast", "Team Slow"], 
                                                                "options": ["Bugatti", "Fiat"], 
                                                                "draftState": [{"pick": "Lambo", "drafter": "Team Fast"}, 
                                                                               {"pick": "Honda", "drafter": "Team Slow"}]}));
  });

  it('GetDraft', function() {
    // indentification number undefined - Status 400
    const req1 = httpMocks.createRequest({method: 'GET', url: '/api/getDraft', query: {}});
    const res1 = httpMocks.createResponse();
    getDraft(req1, res1);
    assert.deepStrictEqual(res1._getStatusCode(), 400);

    // indentification number defined, but does not exist in map of drafts - Status 400
    const req2 = httpMocks.createRequest({method: 'GET', url: '/api/getDraft', query: {id: "50"}});
    const res2 = httpMocks.createResponse();
    getDraft(req2, res2);
    assert.deepStrictEqual(res2._getStatusCode(), 400);

    // request to get the draft was successful with requested identification number - Status 200
    const req3 = httpMocks.createRequest({method: 'GET', url: '/api/getDraft', query: {id: "2"}});
    const res3 = httpMocks.createResponse();
    getDraft(req3, res3);
    assert.deepStrictEqual(res3._getStatusCode(), 200);
    assert.deepStrictEqual(res3._getJSONData(), JSON.stringify(getDraftT(Number(2))));
  });

  it('JoinDraft', function() {
    // indentification number undefined - Status 400
    const req1 = httpMocks.createRequest({method: 'GET', url: '/api/join', query: {}});
    const res1 = httpMocks.createResponse();
    joinDraft(req1, res1);
    assert.deepStrictEqual(res1._getStatusCode(), 400);

    // indentification number defined, but does not exist in map of drafts - Status 400
    const req2 = httpMocks.createRequest({method: 'GET', url: '/api/join', query: {id: "50"}});
    const res2 = httpMocks.createResponse();
    joinDraft(req2, res2);
    assert.deepStrictEqual(res2._getStatusCode(), 200);
    assert.deepStrictEqual({drafters: [], options: [], rounds: 0, draftState: []}, getDraftT(Number(50)));

    // request to get the draft was successful with requested identification number - Status 200
    const req3 = httpMocks.createRequest({method: 'GET', url: '/api/join', query: {id: "2"}});
    const res3 = httpMocks.createResponse();
    joinDraft(req3, res3);
    assert.deepStrictEqual(res3._getStatusCode(), 200);
    assert.deepStrictEqual(res3._getJSONData(), JSON.stringify(getDraftT(Number(2))));
  });

  clearDraftsT();

});
