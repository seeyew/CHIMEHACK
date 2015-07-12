var Subscriber = require('../models/Subscriber');
var fs = require('fs');
// Create a function to handle Twilio SMS / MMS webhook requests
exports.webhook = function(request, response) {

    // Get the user's phone number
    var phone = request.body.From;

    // Try to find a subscriber with the given phone number
    Subscriber.findOne({
        phone: phone
    }, function(err, sub) {
        if (err) return respond('Derp! Please text back again later.');

        if (!sub) {
            // If there's no subscriber associated with this phone number,
            // create one
            var newSubscriber = new Subscriber({
                phone: phone
            });

            newSubscriber.save(function(err, newSub) {
                if (err || !newSub) 
                    return respond('We couldn\'t sign you up - try again.');
                //Signed up the user, let's see if they want to subscribe or not
                processMessage(sub);
                // We're signed up but not subscribed - prompt to subscribe
                //respond('Thanks for contacting us! Text "subscribe" to '
                 //   + 'receive updates via text message.');
            });
        } else {
            // For an existing user, process any input message they sent and
            // send back an appropriate message
            processMessage(sub);
        }
    });

    // Process any message the user sent to us
    function processMessage(subscriber) {
        // get the text message command sent by the user
        var msg = request.body.Body || '';
        msg = msg.toLowerCase().trim();

        // Conditional logic to do different things based on the command from
        // the user
        if (msg === 'unsubscribe') {
            subscriber.save(function(err) {
                if (err)
                    return respond('We could not subscribe you - please try '
                        + 'again.');

                // Otherwise, our subscription has been updated
                if (!subscriber.subscribed) {
                    var responseMessage = 'You have unsubscribed. Text "subscribe"'
                        + ' to start receiving updates again.';

                    respond(responseMessage);
                } else {
                    respond("We ran into issues, please try again")
                }
            });
        } else {
            var responseMessage;
            //This is where we process the states
            if (msg === 'subscribe') {
                // If the user has elected to subscribe for messages, flip the bit
                // and indicate that they have done so.
                subscriber.subscribed = msg === 'subscribe';
                subscriber.state = '0';
                subscriber.waiting = false;
                subscriber.save(function (err) {
                    if (err)
                        return respond('We could not subscribe you - please try '
                            + 'again.');

                    // Otherwise, our subscription has been updated
                    responseMessage = 'You are now subscribed for updates.';
                });
            }

            /***
             *
             *
             *
             *
             * @type {SubscriberSchema.state|{type, default}|string|Object}
             */

            //Get the json object based on the state
            if (!subscriber.waiting) {
                var question = getQuestionBasedOnState(subscriber.state)

                if (!responseMessage) {
                    respond(responseMessage);
                }
                subscriber.waiting = true;
                subscriber.save(function (err) {
                    if (err)
                        return respond('We could not subscribe you - please try '
                            + 'again.');

                    // Otherwise, our subscription has been updated
                    responseMessage = 'You are now subscribed for updates.';
                });
                Subscriber.sendQuestionMessage(subscriber, question, function(err) {
                    if (err) {
                        console.log(err);
                    } else {
                        console.log('successes', 'Messages on their way!');
                    }
                });
            } else {
                var answerFromUser = msg;
                var answers;
                switch (subscriber.state) {
                    case 0:
                        answers = {"1" : 1,"0": 1};
                        break;
                    case 1:
                        answers = {"1" : 2,"0":3};
                        break;
                    case 2:
                        answers = {};
                        break;
                    case 3:
                        answers = {"1" : 4,"0":9};
                        break;
                    case 4:
                        answers = {"1" : 5,"0":8};
                        break;
                    case 5:
                        answers = {"1" : 6,"0":7};
                        break;
                    case 6:
                        answers = {};
                        break;
                    case 7:
                        answers = {}
                        break;
                    case 8:
                        answers = {"1" : 7}
                        break;
                    case 9:
                        answers = {"1" : 7}
                        break;
                    default:
                        break;
                }

                if (msg == "1" || msg == "0") {
                    var nextState = answers[msg];
                    var question = getQuestionBasedOnState(nextState);
                    subscriber.state = nextState;
                    subscriber.waiting = true;
                    subscriber.save(function (err) {
                        if (err)
                            return respond('We could not subscribe you - please try '
                                + 'again.');

                        // Otherwise, our subscription has been updated
                        responseMessage = 'You are now subscribed for updates.';
                    });
                    
                    
                    Subscriber.sendQuestionMessage(subscriber, question, function(err) {
                        if (err) {
                            console.log(err);
                        } else {
                            console.log('successes', 'Messages on their way!');
                        }
                    });

                } else {
                    var responseMessage = 'Sorry, we didn\'t understand that. '
                        + 'available commands are: subscribe or unsubscribe';

                    respond(responseMessage);
                }
            }
        }
    }

    function getQuestionBasedOnState(state) {
        var question;
        switch (state) {
            case 0:
                question = "Is it for you? : Press 1 or for your friend? : Press 0";
                break;
            case 1:
                question = "Is there an immediate danger? Press 1: Yes, Press 0: No";
                break;
            case 2:
                question = "Call the Police";
                break;
            case 3:
                question = "Does your friend know that she is being abused? Press 1: Yes, Press 0: No Press 2: Not sure";
                break;
            case 4:
                question = "Describe the pain. Press 1: Physical pain  Press 0: Emotional pain";
                break;
            case 5:
                question = "Physical Pain. Tell your friend, you're here to help. I can't imagine how scary this is for you. Press 1: Learn self- defence  Press 0: Talk to a Counsellor (646) 846-help";
                break;
            case 6:
                question = "Remember the phrase SING S:Stomach -> Elbow it I:Instep on the foot N : Nose->Punch it G- Groin : Punch it";
                break;
            case 7:
                question = " Talk to a Counsellor (646) 846-4357"
                break;
            case 8:
                question = "Emotional Pain. Tell your friend, you're here to help. I can't imagine how scary this is for you. 1. Recognize that the abuse exists. 2. Ask for support, talk to a counsellor, talk to a friend 3 .Break the Cycle - See yourself in a +ve light. Press 1";
                break;
            case 9:
                question = "I know it's difficult to discuss, but please know you can talk to me about anything. U r not alone. I care abt u & m here 4 u no matter wat. Talk about 1 incident that u noticed . Press 1";
                break;
            default:
            	question= "error";

                break;
        }
        return question;
    }

    // Set Content-Type response header and render XML (TwiML) response in a 
    // Jade template - sends a text message back to user
    function respond(message) {
        response.type('text/xml');
        response.render('twiml', {
            message: message
        });
    }
};

// Handle form submission
exports.sendMessages = function(request, response) {
    // Get message info from form submission
    var message = request.body.message;
    var imageUrl = request.body.imageUrl;

    // Use model function to send messages to all subscribers
    Subscriber.sendMessage(message, imageUrl, function(err) {
        if (err) {
            request.flash('errors', err.message);
        } else {
            request.flash('successes', 'Messages on their way!');
        }

        response.redirect('/');
    });
};