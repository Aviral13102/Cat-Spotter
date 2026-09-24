import pytest
from app.voice.intents import parser

def test_intents():
    res = parser.parse("Start the next task")
    assert res["intent"] in ["start_task", "next_task"]
    
    res = parser.parse("I am done with this task")
    assert res["intent"] == "complete_task"
    
    res = parser.parse("How long will this take?")
    assert res["intent"] == "eta"
    
    res = parser.parse("What is my score?")
    assert res["intent"] == "status"
    
    res = parser.parse("Blah blah gibberish")
    assert res["intent"] == "help"
