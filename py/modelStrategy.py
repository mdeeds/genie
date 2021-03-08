import tensorflow as tf

import oneDie as game


class ModelStrategy:
    stateSize = 0
    moveSize = 0
    model = None
    dictionaryModel = None
    moveDictionary = dict()

    def __init__(self, game):
        self.stateSize = game.getStateSize()
        self.moveSize = game.getMoveSize()
        input = tf.keras.layers.Input(shape=(game.getStateSize()))
        l1 = tf.keras.layers.Dense(units=2).apply(input)
        l2 = tf.keras.layers.Dense(units=2).apply(l1)
        o = tf.keras.layers.Dense(units=game.getMoveSize())(l2)

        self.model = tf.keras.models.Model(inputs=input, outputs=o)
        self.model.compile(optimizer=tf.keras.optimizers.Adam(
            0.001), loss=tf.keras.losses.MeanSquaredError(), metrics=['accuracy'])
        self.model.summary()

    def getMove(self, state):
        if self.model == self.dictionaryModel:
            if str(state) in self.moveDictionary:
                move = self.moveDictionary[str(state)]
                return move
        else:
            self.dictionaryModel = self.model
            self.moveDictionary = dict()
        inputTensor = tf.constant([state], 'float32')
        moveTensor = self.model.predict(inputTensor)
        move = moveTensor[0]
        self.moveDictionary[str(state)] = move
        return move

    def train(self, states, moves):
        checkpoint = tf.keras.callbacks.ModelCheckpoint(
            "checkpoint.hdf5", monitor='val_accuracy', verbose=1,
            save_best_only=True, save_weights_only=False)

        inputTensor = tf.constant(states, 'float32')
        outputTensor = tf.constant(moves, 'float32')

        history = self.model.fit(inputTensor, outputTensor, epochs=50, verbose=0,
                                 shuffle=True, validation_split=0.2, callbacks=[checkpoint])
        # load the most recently saved because the last might not be the best
        self.model = tf.keras.models.load_model("checkpoint.hdf5")

        return history
