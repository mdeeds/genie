import random

import tensorflow as tf

import oneDie as game


class ModelStrategy:
    stateSize = 0
    moveSize = 0
    model = None
    dictionaryModel = None
    moveNoise = 0.0
    moveDictionary = dict()

    def __init__(self, game, moveNoise=0.05):
        self.stateSize = game.getStateSize()
        self.moveSize = game.getMoveSize()
        self.moveNoise = moveNoise
        input = tf.keras.layers.Input(shape=(game.getStateSize()))
        flat = tf.keras.layers.Flatten()(input)
        l1 = tf.keras.layers.Dense(units=12, activation='relu')(flat)
        l2 = tf.keras.layers.Dense(units=12, activation='relu')(l1)
        o = tf.keras.layers.Dense(
            units=game.getMoveSize(), activation='softmax')(l2)

        self.model = tf.keras.models.Model(inputs=input, outputs=o)
        self.model.compile(
            optimizer=tf.keras.optimizers.Adam(0.0001),
            loss=tf.keras.losses.MeanSquaredError(),
            # metrics=['accuracy'])
            metrics=[tf.keras.metrics.MeanSquaredError()]
        )
        self.model.summary()

    def applyNoise(self, move, noiseLevel):
        for element in move:
            element += (random.random()-0.5) * noiseLevel
        return move

    def getMove(self, state):
        if self.model == self.dictionaryModel:
            if str(state) in self.moveDictionary:
                move = self.moveDictionary[str(state)]
                move = self.applyNoise(move, self.moveNoise)
                return move
        else:
            self.dictionaryModel = self.model
            self.moveDictionary = dict()
        inputTensor = tf.constant([state], 'float32')
        moveTensor = self.model.predict(inputTensor)
        move = moveTensor[0]
        self.moveDictionary[str(state)] = move
        move = self.applyNoise(move, self.moveNoise)
        return move

    def train(self, states, moves):
        checkpoint = tf.keras.callbacks.ModelCheckpoint(
            "checkpoint.hdf5", monitor='val_loss', verbose=1,
            save_best_only=True, save_weights_only=False)

        inputTensor = tf.constant(states, 'float32')
        outputTensor = tf.constant(moves, 'float32')

        history = self.model.fit(inputTensor, outputTensor, epochs=5, verbose=0,
                                 shuffle=True, validation_split=0.2, callbacks=[checkpoint])
        # load the most recently saved because the last might not be the best
        self.model = tf.keras.models.load_model("checkpoint.hdf5")

        return history
