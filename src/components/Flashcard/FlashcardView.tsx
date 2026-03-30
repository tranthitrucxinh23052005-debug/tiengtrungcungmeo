import { useState } from 'react';
import { Eye, EyeOff, Volume2, CheckCircle, XCircle } from 'lucide-react';
import type { ReviewCard } from '../../types';

interface FlashcardViewProps {
  card: ReviewCard;
  onResponse: (remembered: boolean) => void;
}

export function FlashcardView({ card, onResponse }: FlashcardViewProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [showPinyin, setShowPinyin] = useState(true);

  function handleFlip() {
    setIsFlipped(!isFlipped);
  }

  function handleResponse(remembered: boolean) {
    setIsFlipped(false);
    setShowPinyin(true);
    onResponse(remembered);
  }

  function speak(text: string) {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'zh-CN';
      utterance.rate = 0.8;
      speechSynthesis.speak(utterance);
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-4 flex items-center justify-between">
        <div className="flex items-center gap-2 text-white">
          <span className="text-sm font-medium">HSK {card.vocabulary.hsk_level}</span>
        </div>
        <button
          onClick={() => setShowPinyin(!showPinyin)}
          className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white px-3 py-1 rounded-lg transition"
        >
          {showPinyin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          <span className="text-sm">{showPinyin ? 'Hide' : 'Show'} Pinyin</span>
        </button>
      </div>

      {!isFlipped ? (
        <div className="p-12">
          <div className="text-center space-y-6">
            <div>
              <p className="text-sm text-gray-500 mb-2 uppercase tracking-wide">Example Sentence</p>
              <p className="text-3xl font-bold text-gray-800 mb-3 leading-relaxed">
                {card.vocabulary.example_sentence}
              </p>
              {showPinyin && (
                <p className="text-lg text-gray-600">{card.vocabulary.example_pinyin}</p>
              )}
            </div>

            <button
              onClick={() => speak(card.vocabulary.example_sentence)}
              className="inline-flex items-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-700 px-4 py-2 rounded-lg transition"
            >
              <Volume2 className="w-5 h-5" />
              <span>Listen</span>
            </button>
          </div>

          <div className="mt-12 text-center">
            <button
              onClick={handleFlip}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold text-lg transition"
            >
              Show Answer
            </button>
          </div>
        </div>
      ) : (
        <div className="p-12">
          <div className="space-y-8">
            <div className="text-center border-b border-gray-200 pb-8">
              <p className="text-6xl font-bold text-gray-800 mb-4">{card.vocabulary.hanzi}</p>
              <p className="text-2xl text-gray-600 mb-2">{card.vocabulary.pinyin}</p>
              <p className="text-xl text-blue-600 font-medium">{card.vocabulary.meaning_vi}</p>
            </div>

            <div className="bg-gray-50 rounded-lg p-6">
              <p className="text-sm text-gray-500 mb-2 uppercase tracking-wide">Example</p>
              <p className="text-xl text-gray-800 mb-2">{card.vocabulary.example_sentence}</p>
              <p className="text-gray-600">{card.vocabulary.example_pinyin}</p>
            </div>

            {card.vocabulary.chunk && (
              <div className="bg-blue-50 rounded-lg p-6">
                <p className="text-sm text-blue-700 mb-2 uppercase tracking-wide font-medium">
                  Common Phrase
                </p>
                <p className="text-xl text-gray-800 mb-2">{card.vocabulary.chunk}</p>
                {card.vocabulary.chunk_pinyin && (
                  <p className="text-gray-600">{card.vocabulary.chunk_pinyin}</p>
                )}
              </div>
            )}

            <div className="flex gap-4 pt-4">
              <button
                onClick={() => handleResponse(false)}
                className="flex-1 flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 text-red-700 px-6 py-4 rounded-lg font-semibold text-lg transition border-2 border-red-200"
              >
                <XCircle className="w-6 h-6" />
                Forgot
              </button>
              <button
                onClick={() => handleResponse(true)}
                className="flex-1 flex items-center justify-center gap-2 bg-green-50 hover:bg-green-100 text-green-700 px-6 py-4 rounded-lg font-semibold text-lg transition border-2 border-green-200"
              >
                <CheckCircle className="w-6 h-6" />
                Remembered
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
