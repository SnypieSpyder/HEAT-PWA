import React from 'react';
import { Card, CardContent } from '../../components/ui';

export const StatementOfFaithPage: React.FC = () => {
  return (
    <div className="container-custom py-12">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-4">
            Statement of Faith
          </h1>
          <p className="text-xl text-neutral-600">
            The foundational beliefs that guide Tampa Bay HEAT
          </p>
        </div>

        <Card>
          <CardContent>
            <div className="space-y-6 text-neutral-700">
              <div>
                <h3 className="font-semibold text-lg text-neutral-900 mb-2">The Bible</h3>
                <p>
                  We believe the Bible to be the inspired, infallible, authoritative Word of God,
                  and the supreme and final authority in all matters of faith and conduct.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-lg text-neutral-900 mb-2">The Trinity</h3>
                <p>
                  We believe in one God, eternally existing in three persons: Father, Son, and
                  Holy Spirit, equal in power and glory.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-lg text-neutral-900 mb-2">Jesus Christ</h3>
                <p>
                  We believe in the deity of our Lord Jesus Christ, in His virgin birth, in His
                  sinless life, in His miracles, in His vicarious and atoning death through His
                  shed blood, in His bodily resurrection, in His ascension to the right hand of
                  the Father, and in His personal return in power and glory.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-lg text-neutral-900 mb-2">Salvation</h3>
                <p>
                  We believe that salvation is by grace through faith in Jesus Christ alone, and
                  that it is a gift of God's mercy, not earned by any works or merit of our own.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-lg text-neutral-900 mb-2">The Holy Spirit</h3>
                <p>
                  We believe in the present ministry of the Holy Spirit, by whose indwelling the
                  Christian is enabled to live a godly life and to serve effectively.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-lg text-neutral-900 mb-2">The Church</h3>
                <p>
                  We believe in the spiritual unity of believers in our Lord Jesus Christ and
                  that all true believers are members of His body, the Church.
                </p>
              </div>

              <div className="mt-8 pt-8 border-t border-neutral-200">
                <p className="text-sm text-neutral-600">
                  While we hold to these core Christian beliefs, Tampa Bay HEAT welcomes families
                  from various denominational backgrounds who respect our statement of faith. We
                  focus on the essentials of the Christian faith while allowing liberty in
                  secondary matters.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

